import React from 'react';
import { pageMetadata } from '@/app/lib/seo';
import { clubForSeo } from '@/app/lib/seoData';
import { resolveImageUrl } from '@/app/lib/api';
import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { fetchClubById, fetchEventsByClubId, fetchAnnouncementsByClubId } from '@/app/lib/api';
import ClubProfileClient from './ClubProfileClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const club = await clubForSeo(id);
  if (!club) return { robots: { index: false, follow: false } };
  return pageMetadata(club.clubName, club.description || club.clubName, `/club/${encodeURIComponent(id)}`,
    club.logoUrl ? resolveImageUrl(club.logoUrl) : undefined);
}

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