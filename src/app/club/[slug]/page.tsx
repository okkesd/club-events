import React from 'react';
import { fetchClubDataBySlug } from '../../lib/api';
import { notFound } from 'next/navigation';
import ClubProfileClient from '@/app/club/[slug]/components/ClubProfileClient'; // Import the client component

// This is the prop type for our page component
type ClubPageProps = {
  params: Promise<{
    slug: string; // `slug` matches the folder name [slug]
  }>;
};

/**
 * Server Component: The Club Profile Page
 * Fetches data and passes it to the client component for interactivity.
 */
export default async function ClubProfilePage({ params }: ClubPageProps) {
  const { slug } = await params; // No need to await `params` in v13+
  const data = await fetchClubDataBySlug(slug);

  // If no club is found, show a 404 page
  if (!data) {
    notFound();
  }

  // Render the Client Component and pass the fetched data as a prop
  return (
    <div className="flex-grow bg-gray-50 px-4 sm:px-6 lg:px-8">
      <ClubProfileClient data={data} />
    </div>
  );
}