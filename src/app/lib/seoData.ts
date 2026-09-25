import 'server-only';
import { cache } from 'react';
import type { IAnnouncement, ClubData } from './types';

type PublicResponse<T> = { success: boolean; data: T; pagination?: { totalPages: number } };

async function publicData<T>(path: string): Promise<PublicResponse<T> | null> {
  const response = await fetch(`${(process.env.BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')}/${path}`, {
    headers: { 'x-api-key': process.env.API_SECRET_KEY || '' },
    next: { revalidate: 3600, tags: [path.split(/[/?]/)[0]] },
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Public content request failed: ${response.status}`);
  const body: PublicResponse<T> = await response.json();
  if (!body.success || body.data == null) throw new Error('Invalid public content response');
  return body;
}

export const announcementForSeo = cache(async (id: string) => (await publicData<IAnnouncement>(`announcements/${encodeURIComponent(id)}`))?.data ?? null);
export const clubForSeo = cache(async (id: string) => (await publicData<ClubData>(`clubs/${encodeURIComponent(id)}`))?.data ?? null);

export async function sitemapItems(section: 'events' | 'clubs' | 'announcements') {
  const items: { id: string }[] = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page++) {
    const result = await publicData<{ id: string }[]>(`${section}?page=${page}&page_size=100`);
    if (!result || !Array.isArray(result.data)) throw new Error('Invalid sitemap response');
    items.push(...result.data);
    totalPages = result.pagination?.totalPages ?? 1;
    if (!Number.isInteger(totalPages) || totalPages < 0 || totalPages > 400) throw new Error('Invalid sitemap page count');
  }
  return items;
}
