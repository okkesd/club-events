import type { Metadata } from 'next';
import type { IEvent } from './types';

export const siteName = 'Evenements';
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://evenements.duckdns.org').origin;
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
export const descriptionText = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);

export function pageMetadata(title: string, description: string, path: string, image?: string): Metadata {
  const url = absoluteUrl(path);
  const images = [{ url: image || absoluteUrl('/opengraph-image'), alt: title }];
  return {
    title, description: descriptionText(description), alternates: { canonical: url },
    openGraph: { type: 'website', siteName, title, description: descriptionText(description), url, images },
    twitter: { card: 'summary_large_image', title, description: descriptionText(description), images: images.map(item => item.url) },
  };
}

export function eventStructuredData(event: IEvent, image?: string) {
  const time = /^(\d{2}:\d{2})(?::\d{2})?$/.exec(event.startTime || '');
  return {
    '@context': 'https://schema.org', '@type': 'Event', name: event.title,
    description: event.description, url: absoluteUrl(`/event/${encodeURIComponent(event.id)}`),
    startDate: time ? `${event.date}T${time[1]}:00+03:00` : event.date,
    ...(image && { image: [image] }),
    ...(event.location && { location: { '@type': 'Place', name: event.location } }),
    ...(event.clubName && { organizer: { '@type': 'Organization', name: event.clubName, url: absoluteUrl(`/club/${encodeURIComponent(event.clubId)}`) } }),
  };
}

export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
