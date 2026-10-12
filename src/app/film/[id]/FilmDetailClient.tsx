"use client";

import Link from 'next/link';
import { ChevronLeft, Clock, ExternalLink, MapPin, Users } from 'lucide-react';
import type { CinemaFilm, CinemaScreening } from '@/app/lib/cinema';
import { EventBrochure } from '@/app/event/[id]/EventBrochure';
import { ShareButton } from '@/app/event/[id]/ShareButton';
import EventMarkdown from '@/app/components/EventMarkdown';
import { useUI } from '@/i18n/useUI';

export default function FilmDetailClient({ film }: { film: CinemaFilm }) {
  const { t, locale } = useUI();
  const venues = [...new Set(film.screenings.map(row => row.venue))];
  const days = new Map<string, Map<string, CinemaScreening[]>>();
  for (const screening of film.screenings) {
    const date = screening.startsAt.slice(0, 10);
    if (!days.has(date)) days.set(date, new Map());
    const groups = days.get(date)!;
    if (!groups.has(screening.venue)) groups.set(screening.venue, []);
    groups.get(screening.venue)!.push(screening);
  }
  const panel = 'rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 vibrant:border-campus-border vibrant:bg-white/80 md:p-8';
  return <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-gray-100 vibrant:bg-white vibrant:text-gray-900 sm:px-6 lg:px-8">
    <div className="mx-auto mb-6 max-w-[1400px]">
      <Link href="/main?mode=sinefil" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300 vibrant:text-campus-muted vibrant:hover:text-campus-accent focus-visible:outline-2 focus-visible:outline-offset-4">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />{t('Back to Calendar')}
      </Link>
    </div>
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-8 lg:grid-cols-12">
      {film.imageUrl && <div className="lg:col-span-3">
        <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 vibrant:border-campus-border vibrant:bg-white/80">
          <EventBrochure src={film.imageUrl} alt={film.title} />
        </div>
      </div>}
      <div className={`${film.imageUrl ? 'lg:col-span-6' : 'lg:col-span-8'} min-w-0 space-y-6`}>
        <section className={panel}>
          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">{film.title}</h1>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 vibrant:text-campus-ink"><Users className="h-4 w-4 shrink-0" aria-hidden="true" />Sinefil’s Eye{venues.length ? ` · ${venues.join(', ')}` : ''}</p>
        </section>
        <section className={panel}>
          <h2 className="mb-4 text-lg font-bold">{t('About Film')}</h2>
          <div className="text-gray-600 dark:text-gray-200 vibrant:text-campus-ink"><EventMarkdown text={film.description} /></div>
          <a href={film.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 vibrant:border-campus-border vibrant:text-campus-ink focus-visible:outline-2 focus-visible:outline-offset-4">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />{t('View source')}
          </a>
        </section>
      </div>
      <aside className={`${film.imageUrl ? 'lg:col-span-3' : 'lg:col-span-4'} min-w-0`}>
        <div className={`${panel} space-y-6`}>
          <h2 className="flex items-center gap-2 text-lg font-bold"><Clock className="h-5 w-5 text-blue-600 dark:text-blue-300 vibrant:text-campus-ink" aria-hidden="true" />{t('Screenings')}</h2>
          {days.size ? [...days].map(([date, groups]) => <section key={date}>
            <h3 className="mb-3 text-sm font-semibold">{new Date(`${date}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
            <div className="space-y-3">{[...groups].map(([venue, rows]) => <div key={venue}>
              <p className="mb-2 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-300 vibrant:text-campus-muted"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{venue}</p>
              <div className="flex flex-wrap gap-2">{rows.map(row => <a key={row.id} id={`screening-${row.id}`}
                href={row.ticketUrl || row.sourceUrl} target="_blank" rel="noopener noreferrer"
                aria-label={`${date}, ${venue}, ${row.startsAt.slice(11, 16)} · ${row.ticketUrl ? t('Tickets') : t('Screening details')}`}
                title={row.auditorium || venue}
                className="scroll-mt-24 inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold tabular-nums text-blue-700 transition-colors hover:bg-blue-100 target:ring-2 target:ring-blue-500 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/50 vibrant:border-campus-border vibrant:bg-campus-soft vibrant:text-campus-ink vibrant:hover:bg-campus-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                {row.startsAt.slice(11, 16)}<ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>)}</div>
            </div>)}</div>
          </section>) : <p className="text-sm text-gray-500 dark:text-gray-300">{t('No screenings available.')}</p>}
          <div className="border-t border-gray-100 pt-4 dark:border-gray-800 vibrant:border-campus-border"><ShareButton title={film.title} /></div>
        </div>
      </aside>
    </div>
  </div>;
}
