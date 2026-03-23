import React from 'react';
import { notFound } from 'next/navigation';
import { fetchClubById, fetchEventsByClubId, fetchAnnouncementsByClubId } from '@/app/lib/api';
import ClubProfileClient from './ClubProfileClient';

export default async function ClubProfilePage({ params }: { params: Promise<{ id: string }>; }) {
  const { id } = await params;

  const [club, clubEvents, clubAnnouncements] = await Promise.all([
    fetchClubById(id),
    fetchEventsByClubId(id),
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