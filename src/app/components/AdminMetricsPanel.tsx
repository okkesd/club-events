"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useUI } from '@/i18n/useUI';
import { fetchAdminMetrics, metricDefinitions, type AdminMetrics } from '@/app/lib/adminMetrics';

export default function AdminMetricsPanel() {
  const { t, locale } = useUI();
  const [data, setData] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchAdminMetrics(controller.signal).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [revision]);

  const number = (value: number | null | undefined) => value == null ? '—' : new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const date = (value: string) => new Date(`${value}T12:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const comparison = (current: number | null | undefined, previous: number | null | undefined) => {
    if (current == null || previous == null) return t('Comparison unavailable');
    if (previous === 0) return current === 0 ? t('No change') : t('Previous period: 0');
    const percent = (current - previous) / previous * 100;
    return `${percent > 0 ? '+' : ''}${number(percent)}% ${t('vs previous 7 days')}`;
  };
  const panel = 'rounded-xl border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 bg-gray-50 dark:bg-gray-950 vibrant:bg-purple-50/50 p-4';

  return <section className="p-4 md:p-6 space-y-6 text-gray-900 dark:text-gray-100 vibrant:text-purple-950" aria-busy={loading}>
    <div className="flex flex-wrap justify-between items-start gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-blue-600" />{t('Metrics')}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('Last 7 complete days, compared with the previous 7 days.')}</p>
        {data && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{date(data.period.from)} – {date(data.period.to)} · {data.period.timezone}</p>}
      </div>
      <button type="button" onClick={() => { setLoading(true); setError(false); setRevision(value => value + 1); }} disabled={loading} className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm disabled:opacity-50">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />{t('Refresh metrics')}
      </button>
    </div>
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t('Metrics could not be loaded. Please refresh.')}</p>}
    {loading && !data ? <p role="status" className="py-12 text-center">{t('Loading...')}</p> : data && <>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {metricDefinitions.map(([key, label]) => {
          const metric = data.metrics[key];
          return <div key={key} className={panel}>
            <h3 className="text-sm text-gray-600 dark:text-gray-400">{t(label)}</h3>
            <p className="my-2 text-3xl font-bold tabular-nums">{number(metric?.current)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{comparison(metric?.current, metric?.previous)}</p>
          </div>;
        })}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{t('Average views counts events viewed during the period. A dash means data is unavailable.')}</p>
      <div>
        <h3 className="font-semibold mb-3">{t('Current totals and queues')}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {([
            ['uniqueSiteVisitors', 'Unique site visitors (all time)'], ['activeSubscribers', 'Active subscribers'], ['pendingClubs', 'Pending clubs'],
            ['pendingSuggestions', 'Pending suggestions'], ['pendingScrapedEvents', 'Pending scraped events'],
          ] as const).map(([key, label]) => <div key={key} className={panel}><p className="text-sm text-gray-500 dark:text-gray-400">{t(label)}</p><p className="mt-2 text-2xl font-bold tabular-nums">{number(data.totals[key])}</p></div>)}
        </div>
      </div>
      <div className="overflow-x-auto">
        {data.siteVisitorsTrackingStartedAt && <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">{t('Site visitors counted since {date}. Each browser counts once; earlier visits are not included.', { date: new Date(data.siteVisitorsTrackingStartedAt).toLocaleDateString(locale, { timeZone: data.period.timezone }) })}</p>}
        <h3 className="font-semibold mb-3">{t('Daily activity')}</h3>
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-gray-500 dark:text-gray-400"><tr>{['Date', 'Published events', 'Event views', 'New likes', 'New subscribers'].map(label => <th key={label} className="px-3 py-2 font-medium">{t(label)}</th>)}</tr></thead>
          <tbody>{data.daily.map(day => <tr key={day.date} className="border-t border-gray-100 dark:border-gray-800"><td className="px-3 py-3">{date(day.date)}</td>{[day.publishedEvents, day.eventViews, day.newLikes, day.newSubscribers].map((value, i) => <td key={i} className="px-3 py-3 tabular-nums">{number(value)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold mb-3">{t('Most viewed events')}</h3>
        {data.topEvents.length ? <ul className="divide-y divide-gray-100 dark:divide-gray-800">{data.topEvents.map(event => <li key={event.id} className="flex items-center justify-between gap-4 py-3 text-sm"><Link href={`/event/${encodeURIComponent(event.id)}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-words">{event.title}</Link><span className="shrink-0 text-gray-500 dark:text-gray-400">{t('{views} views · {likes} likes', { views: number(event.views), likes: number(event.likes) })}</span></li>)}</ul> : <p className="text-sm text-gray-500">{t('No activity in this period.')}</p>}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{t('Updated at {time}', { time: new Date(data.generatedAt).toLocaleString(locale, { timeZone: data.period.timezone }) })}</p>
    </>}
  </section>;
}
