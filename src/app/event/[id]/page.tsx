import React from 'react';
import { fetchEventById } from '@/app/lib/api';
import { IEvent } from '@/app/lib/types';
import { notFound } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, Hash, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import EventDetailClient from './components/EventDetailClient';

// This is the prop type for our page component.
// Next.js passes `params` to dynamic route pages.
type EventPageProps = {
  params: Promise<{
    id: string; // `id` matches the folder name [id]
  }>;
};

/**
 * This is a Server Component that fetches and displays
 * data for a single event based on the URL.
 */
export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await fetchEventById(id);

  if (!event) {
    notFound();
  }

  // 2. Render the client component, passing the event as a prop
  return (
    <EventDetailClient event={event} />
  );
}