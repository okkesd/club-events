import React from 'react';
import { fetchAllClubs } from '../lib/api';
import ClubCard from './components/ClubCard'; 
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react'; 

/**
 * Server Component: The Club Directory Page
 */
export default async function ClubDirectoryPage() {
  const clubs = await fetchAllClubs();

  return (
    <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Link 
          href="/main"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mb-4 ml-60"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Calendar
        </Link>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          All Clubs
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 2. Use the imported component */}
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </div>
    </div>
  );
}