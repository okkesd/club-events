import { getAuthHeader, handleApiError } from './api';

export const metricDefinitions = [
  ['scheduledEvents', 'Scheduled events'],
  ['publishedEvents', 'Published events'],
  ['eventViews', 'Event views'],
  ['averageViewsPerEvent', 'Average views per event'],
  ['uniqueVisitors', 'Unique visitors'],
  ['newLikes', 'New likes'],
  ['newSubscribers', 'New subscribers'],
  ['unsubscribes', 'Unsubscribes'],
  ['activeClubs', 'Clubs publishing events'],
  ['newClubs', 'New clubs'],
  ['newSuggestions', 'New suggestions'],
  ['approvedSuggestions', 'Approved suggestions'],
] as const;
type MetricKey = typeof metricDefinitions[number][0];
export interface AdminMetrics {
  period: { from: string; to: string; previousFrom: string; previousTo: string; timezone: string };
  generatedAt: string;
  siteVisitorsTrackingStartedAt?: string | null;
  metrics: Record<MetricKey, { current: number | null; previous: number | null }>;
  totals: { uniqueSiteVisitors?: number; activeSubscribers: number | null; pendingClubs: number | null; pendingSuggestions: number | null; pendingScrapedEvents: number | null };
  daily: { date: string; publishedEvents: number | null; eventViews: number | null; newLikes: number | null; newSubscribers: number | null }[];
  topEvents: { id: string; title: string; views: number; likes: number }[];
}

export async function fetchAdminMetrics(signal?: AbortSignal): Promise<AdminMetrics> {
  const auth = getAuthHeader();
  if (!auth) throw new Error('Authentication required');
  const res = await fetch('/api/proxy/admin/metrics?days=7', {
    headers: auth, cache: 'no-store', credentials: 'same-origin', signal,
  });
  if (!res.ok) await handleApiError(res);
  const result = await res.json();
  if (result.success !== true || !result.data?.period || !result.data.metrics || !result.data.totals ||
      !Array.isArray(result.data.daily) || !Array.isArray(result.data.topEvents)) throw new Error('Invalid metrics response');
  return result.data;
}
