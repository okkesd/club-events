import React from 'react';
import { pageMetadata, eventStructuredData, jsonLd } from '@/app/lib/seo';
import {getUI} from '@/i18n/server';
import { Metadata } from 'next';
import { fetchEventById, resolveImageUrl } from '@/app/lib/api';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const {t} = await getUI();
  const { id } = await params;
  const event = await fetchEventById(id);

  if (!event) {
    return { title: t("Event Not Found"), robots: { index: false, follow: false } };
  }

  const title = event.title;
  const description = event.description?.slice(0, 160) || t("Check out this event!");
  const imageUrl = event.coverImage ? resolveImageUrl(event.coverImage) : undefined;

  return pageMetadata(title, description, `/event/${encodeURIComponent(id)}`, imageUrl);
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;

  // Read visitor UUID: cookie (returning visitor) or header (first visit, set by middleware)
  const cookieStore = await cookies();
  const headersList = await headers();
  const visitorId = cookieStore.get('visitor_id')?.value || headersList.get('x-visitor-id') || '';

  const event = await fetchEventById(id, visitorId);

  if (!event) notFound();

  const image = event.coverImage ? resolveImageUrl(event.coverImage) : undefined;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(eventStructuredData(event, image)) }} />
    <EventDetailClient event={event} />
  </>;
}
