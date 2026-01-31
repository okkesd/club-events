import React from 'react';
import { fetchEventById } from '@/app/lib/api';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await fetchEventById(id);
  
  if (!event) notFound();

  // Pass data to Client Component
  return <EventDetailClient event={event} />;
}