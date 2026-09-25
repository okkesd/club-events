import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { absoluteUrl } from './lib/seo';
import { sitemapItems } from './lib/seoData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The backend is available at runtime, not while building the Docker image.
  // publicData still caches successful backend responses for one hour.
  await connection();
  const [events, clubs, announcements] = await Promise.all([
    sitemapItems('events'), sitemapItems('clubs'), sitemapItems('announcements'),
  ]);
  const paths = ['/main', '/events', '/clubs', '/announcements', '/about-us', '/contact',
    '/legal/privacy', '/legal/terms', '/legal/cookies',
    ...events.map(item => `/event/${encodeURIComponent(item.id)}`),
    ...clubs.map(item => `/club/${encodeURIComponent(item.id)}`),
    ...announcements.map(item => `/announcements/${encodeURIComponent(item.id)}`)];
  return [...new Set(paths)].map(path => ({ url: absoluteUrl(path) }));
}
