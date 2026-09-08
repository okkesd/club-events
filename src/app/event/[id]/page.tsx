import React from 'react';
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
    return { title: t("Event Not Found") };
  }

  const title = event.title;
  const description = event.description?.slice(0, 160) || t("Check out this event!");
  const imageUrl = event.coverImage ? resolveImageUrl(event.coverImage) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      }),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;

  // Read visitor UUID: cookie (returning visitor) or header (first visit, set by middleware)
  const cookieStore = await cookies();
  const headersList = await headers();
  const visitorId = cookieStore.get('visitor_id')?.value || headersList.get('x-visitor-id') || '';

  const event = await fetchEventById(id, visitorId);

  if (!event) notFound();

  return <EventDetailClient event={event} />;
}
