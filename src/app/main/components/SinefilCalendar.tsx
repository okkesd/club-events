"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, ExternalLink, Film, Loader2, MapPin } from 'lucide-react';
import { calendarDateString, parseCalendarDate } from '@/app/lib/calendarWeek';
import { formatWeekHeader, getWeekDays } from '@/app/lib/dateUtils';
import { useUI } from '@/i18n/useUI';

type Screening = {
  id: string; title: string; venue: string; startsAt: string; endsAt: string | null;
  description: string; imageUrl: string | null; sourceUrl: string; ticketUrl: string | null;
  auditorium: string | null;
};

export default function SinefilCalendar({ week }: { week: string }) {
  const { t, locale } = useUI();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const days = useMemo(() => getWeekDays(parseCalendarDate(week)!), [week]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    async function load() {
      const rows: Screening[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const query = new URLSearchParams({ week, page: String(page), page_size: '100' });
        const response = await fetch(`/api/proxy/sinefil/screenings?${query}`, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Screenings unavailable');
        const result = await response.json();
        if (result.success !== true || !Array.isArray(result.data)) throw new Error('Invalid screenings');
        rows.push(...result.data);
        totalPages = result.pagination?.totalPages ?? 1;
        page++;
      } while (page <= totalPages);
      if (!controller.signal.aborted) setScreenings(rows);
    }
    load().catch(() => {
      if (!controller.signal.aborted) setError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [week, attempt]);

  const navigate = (offset: number) => {
    const date = parseCalendarDate(week)!;
    date.setDate(date.getDate() + offset);
    const query = new URLSearchParams(searchParams.toString());
    query.set('week', calendarDateString(date));
    router.push(`/main?${query}`, { scroll: false });
  };
  const clock = (value: string) => value.slice(11, 16);
  const button = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 vibrant:hover:bg-campus-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500';

  return <div className="mx-auto w-full max-w-5xl px-4 py-6 text-gray-900 dark:text-gray-100 vibrant:text-campus-ink">
    <header className="mb-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Film className="h-6 w-6 text-amber-600" aria-hidden="true" />Sinefil’s Eye</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 vibrant:text-campus-muted">{t('Majestik, Atlas 1948 and Pera Film')}</p>
        </div>
        <button type="button" className={button} onClick={() => {
          const query = new URLSearchParams(searchParams.toString());
          query.delete('mode');
          router.push(`/main?${query}`);
        }}>{t('School events')}</button>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-gray-200 p-1 dark:border-gray-800 vibrant:border-campus-border">
        <button type="button" className={button} aria-label={t('Previous week')} onClick={() => navigate(-7)}><ChevronLeft aria-hidden="true" /></button>
        <h2 className="text-center text-sm font-semibold sm:text-base">{formatWeekHeader(days, true, locale)}</h2>
        <button type="button" className={button} aria-label={t('Next week')} onClick={() => navigate(7)}><ChevronRight aria-hidden="true" /></button>
      </div>
    </header>
    {loading ? <div role="status" aria-label={t('Cinema screenings')} className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-amber-600" /></div>
      : error ? <div role="status" className="py-12 text-center"><p>{t('Could not load screenings.')}</p><button type="button" className={button} onClick={() => setAttempt(value => value + 1)}>{t('Retry')}</button></div>
      : !screenings.length ? <p role="status" className="py-12 text-center text-gray-500 dark:text-gray-300">{t('No screenings this week.')}</p>
      : <div className="space-y-8">{days.map(day => {
        const date = calendarDateString(day);
        const rows = screenings.filter(row => row.startsAt.slice(0, 10) === date);
        if (!rows.length) return null;
        return <section key={date} aria-label={day.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}>
          <h3 className="mb-3 border-b border-gray-200 pb-2 text-base font-semibold dark:border-gray-800 vibrant:border-campus-border">{day.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <div className="grid gap-3 md:grid-cols-2">{rows.map(row => <article key={row.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 vibrant:border-campus-border">
            {row.imageUrl && <img src={row.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-32 w-20 shrink-0 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold leading-5">{row.title}</h4>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium tabular-nums text-amber-700 dark:text-amber-300"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{clock(row.startsAt)}{row.endsAt ? ` – ${clock(row.endsAt)}` : ''}</p>
              <p className="mt-1 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-300 vibrant:text-campus-muted"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{row.venue}{row.auditorium ? ` · ${row.auditorium}` : ''}</p>
              {row.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-300 vibrant:text-campus-ink">{row.description}</p>}
              <a href={row.ticketUrl || row.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${button} mt-2 -ml-3 text-amber-700 dark:text-amber-300`}>
                {row.ticketUrl ? t('Tickets') : t('Screening details')}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </article>)}</div>
        </section>;
      })}</div>}
  </div>;
}
