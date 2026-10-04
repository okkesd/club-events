import EventCalendar from '@/app/main/components/EventCalendar';
import { calendarWeek, currentCalendarWeek } from '@/app/lib/calendarWeek';
import { redirect } from 'next/navigation';

export default async function MainCalendarPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requested = typeof params.week === 'string' ? params.week : undefined;
  const week = (requested && calendarWeek(requested)) || currentCalendarWeek();
  if (params.week !== week) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === 'week' || value === undefined) continue;
      for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
    }
    query.set('week', week);
    redirect(`/main?${query}`);
  }
  return <EventCalendar key={week} week={week} />;
}
