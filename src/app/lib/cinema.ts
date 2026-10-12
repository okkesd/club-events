import type { IEvent } from './types';

export type CinemaScreening = {
  id: string;
  filmId: string;
  title: string;
  venue: string;
  startsAt: string;
  endsAt: string | null;
  description: string;
  imageUrl: string | null;
  sourceUrl: string;
  ticketUrl: string | null;
  auditorium: string | null;
};

export type CinemaFilm = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  sourceUrl: string;
  screenings: CinemaScreening[];
};

export function screeningToEvent(row: CinemaScreening): IEvent {
  // API datetimes are Istanbul wall times. UTC parsing measures the interval
  // without interpreting those wall times in the visitor's local timezone.
  const duration = row.endsAt
    ? (Date.parse(`${row.endsAt}Z`) - Date.parse(`${row.startsAt}Z`)) / 3_600_000 : 0;
  const known = Number.isFinite(duration) && duration > 0;
  return {
    id: row.id, cinemaFilmId: row.filmId, detailHref: `/film/${row.filmId}#screening-${row.id}`,
    title: row.title, description: row.description, organizerName: row.venue,
    clubId: '', clubName: row.venue, date: row.startsAt.slice(0, 10), startTime: row.startsAt.slice(11, 16),
    endTime: known ? row.endsAt!.slice(11, 16) : '',
    // Unknown runtimes occupy one grid row; the UI only displays their start.
    duration: known ? duration : 1, durationKnown: known,
    locationType: 'off-campus', location: row.venue, coverImage: row.imageUrl ?? undefined,
    sourcePostUrl: row.sourceUrl, registrationLink: row.ticketUrl ?? undefined,
    isRegistrationOpen: !!row.ticketUrl, likes: 0, viewCount: 0,
  };
}

export function groupFilmsForDay(events: IEvent[]): IEvent[] {
  const groups = new Map<string, IEvent>();
  for (const event of [...events].sort((a, b) => a.startTime.localeCompare(b.startTime))) {
    if (!event.cinemaFilmId) {
      groups.set(event.id, event);
      continue;
    }
    const key = `${event.date}:${event.cinemaFilmId}`;
    let film = groups.get(key);
    if (!film) {
      film = { ...event, detailHref: `/film/${event.cinemaFilmId}`, screeningGroups: [] };
      groups.set(key, film);
    }
    let venue = film.screeningGroups!.find(group => group.venue === event.location);
    if (!venue) {
      venue = { venue: event.location, times: [] };
      film.screeningGroups!.push(venue);
    }
    if (!venue.times.includes(event.startTime)) venue.times.push(event.startTime);
  }
  return [...groups.values()];
}

export async function fetchCinemaWeek(week: string): Promise<IEvent[]> {
  const rows: IEvent[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const query = new URLSearchParams({ week, page: String(page), page_size: '100' });
    const response = await fetch(`/api/proxy/sinefil/screenings?${query}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Screenings unavailable');
    const result = await response.json();
    if (result.success !== true || !Array.isArray(result.data)) throw new Error('Invalid screenings');
    if (result.data.some((row: CinemaScreening) => !row.filmId)) throw new Error('Invalid film identity');
    rows.push(...result.data.map(screeningToEvent));
    totalPages = result.pagination?.totalPages ?? 1;
    page++;
  } while (page <= totalPages);
  return rows;
}
