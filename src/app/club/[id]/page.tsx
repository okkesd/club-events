import React from 'react';
import { notFound } from 'next/navigation';
import { fetchClubById, fetchEventsByClubId } from '@/app/lib/api'; 
import ClubProfileClient from './ClubProfileClient'; // Import the new component

export default async function ClubProfilePage({ params }: { params: Promise<{ id: string }>; }) {
  // 1. Fetch Data on the Server
  const { id } = await params;
  
  const clubDataPromise = fetchClubById(id);
  const clubEventsPromise = fetchEventsByClubId(id);

  const [club, clubEvents] = await Promise.all([clubDataPromise, clubEventsPromise]);

  if (!club) {
    notFound(); 
  }

  // 2. Pass data to the Client Component
  // The client component handles all rendering, interactions, and "Edit Mode"
  return (
    <ClubProfileClient 
      initialClub={club} 
      events={clubEvents || []} 
    />
  );
}