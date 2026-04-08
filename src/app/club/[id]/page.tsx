import React from 'react';
import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { fetchClubById, fetchEventsByClubId, fetchAnnouncementsByClubId } from '@/app/lib/api';
import ClubProfileClient from './ClubProfileClient';

export default async function ClubProfilePage({ params }: { params: Promise<{ id: string }>; }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const headersList = await headers();
  const visitorId = cookieStore.get('visitor_id')?.value || headersList.get('x-visitor-id') || '';

  const [club, clubEvents, clubAnnouncements] = await Promise.all([
    fetchClubById(id),
    fetchEventsByClubId(id, visitorId),
    fetchAnnouncementsByClubId(id).catch(() => []),
  ]);

  if (!club) {
    notFound();
  }

  return (
    <ClubProfileClient
      initialClub={club}
      events={clubEvents || []}
      announcements={clubAnnouncements || []}
    />
  );
}