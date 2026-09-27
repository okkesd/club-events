"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Heart, TrendingUp, Clock3, ArrowUpRight } from 'lucide-react';
import { getEventHighlights } from '@/app/lib/api';
import type { IEventHighlights } from '@/app/lib/types';
import { useUI } from '@/i18n/useUI';

export default function CalendarHighlights() {
  const { t, locale } = useUI();
  const [data, setData] = useState<IEventHighlights | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!data?.nextEvent) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [data?.nextEvent]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    let controller: AbortController | undefined;
    const load = () => {
      controller?.abort();
      if (!media.matches) return;
      const request = new AbortController();
      controller = request;
      setError(false);
      getEventHighlights(request.signal).then(result => {
        if (!request.signal.aborted) setData(result);
      }).catch(() => {
        if (!request.signal.aborted) setError(true);
      });
    };
    load();
    media.addEventListener('change', load);
    return () => {
      controller?.abort();
      media.removeEventListener('change', load);
    };
  }, [attempt]);

  const dateLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, {
    day: 'numeric', month: 'short', timeZone: data?.timezone ?? 'Europe/Istanbul',
  });
  const muted = 'text-gray-500 dark:text-gray-300 vibrant:text-campus-muted';
  const card = 'rounded-lg border border-[#eaefef] bg-white p-4 dark:border-gray-800 dark:bg-gray-900 vibrant:border-campus-border vibrant:bg-white';
  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 vibrant:focus-visible:outline-campus-accent';
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: data?.timezone ?? 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(now));
  const todayDate = ['year', 'month', 'day'].map(type => today.find(part => part.type === type)?.value).join('-');

  return (
    <aside aria-label={t('Campus highlights')} className="sticky top-24 hidden space-y-4 text-gray-900 dark:text-gray-100 vibrant:text-campus-ink lg:block">
      <h2 className="sr-only">{t('Campus highlights')}</h2>
      {error ? <div className={card} role="status">
        <p className={`text-xs ${muted}`}>{t('Could not load highlights.')}</p>
        <button type="button" onClick={() => setAttempt(value => value + 1)} className={`mt-2 rounded text-xs underline underline-offset-4 ${focus}`}>{t('Retry')}</button>
      </div> : !data ? <p role="status" className={`${card} text-xs ${muted}`}>{t('Loading highlights…')}</p> : <>
        <section className={card}>
          <div className="flex items-center justify-between gap-2">
            <h3 className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${muted}`}>
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{t('This week')}
            </h3>
            <p className={`text-[10px] ${muted}`}>{dateLabel(data.weekStart)} – {dateLabel(data.weekEnd)}</p>
          </div>
          <div className="py-5 text-center">
            <p className="text-5xl font-bold tracking-tight tabular-nums text-blue-600 dark:text-blue-300 vibrant:text-campus-accent">{data.weeklyEventCount.toLocaleString(locale)}</p>
            <p className={`mt-2 text-sm ${muted}`}>{t('Total events')}</p>
          </div>
          <p className="sr-only">{t('Events this week, including past days')}</p>
        </section>

        <section className={card}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className={`h-4 w-4 ${muted}`} aria-hidden="true" />{t('Popular events')}
          </h3>
          <p className="sr-only">{t('Most liked this week')}. {t('Ranked by total likes')}</p>
          {data.popularEvents.length ? <ul className="space-y-1">
            {data.popularEvents.map(event => <li key={event.id}>
              <Link href={`/event/${encodeURIComponent(event.id)}`} className={`-mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 vibrant:hover:bg-campus-surface ${focus}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{event.title}</p>
                  <p className={`mt-1 text-[11px] ${muted}`}>{dateLabel(event.date)} · {event.startTime}</p>
                </div>
                <span aria-label={t('{count} likes', { count: event.likes })} className="flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-rose-700 dark:text-rose-300 vibrant:text-campus-accent">
                  {event.likes.toLocaleString(locale)}<Heart className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>)}
          </ul> : <p className={`text-xs leading-5 ${muted}`}>{t('No liked events this week yet.')}</p>}
        </section>

        <section className={`${card} border-l-[3px] border-l-amber-400 dark:border-l-amber-400 vibrant:border-l-campus-gold`}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Clock3 className={`h-4 w-4 ${muted}`} aria-hidden="true" />{t('Next event')}
          </h3>
          {data.nextEvent ? <Link href={`/event/${encodeURIComponent(data.nextEvent.id)}`} className={`group -m-1 block rounded p-1 ${focus}`}>
            <p className="text-base font-semibold tabular-nums text-blue-600 dark:text-blue-300 vibrant:text-campus-accent">
              {data.nextEvent.date === todayDate ? t('Today') : dateLabel(data.nextEvent.date)} · {data.nextEvent.startTime}
            </p>
            <div className="mt-2 flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm font-semibold leading-5 line-clamp-2 group-hover:underline underline-offset-4">{data.nextEvent.title}</p>
              <ArrowUpRight className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${muted}`} aria-hidden="true" />
            </div>
            {data.nextEvent.location && <p className={`mt-1 truncate text-xs ${muted}`}>{data.nextEvent.location}</p>}
          </Link> : <p className={`text-xs leading-5 ${muted}`}>{t('No upcoming events yet.')}</p>}
        </section>
      </>}
    </aside>
  );
}
