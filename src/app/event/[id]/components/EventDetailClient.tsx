"use client"; // This component must be client-side

import React from 'react';
import { IEvent } from '@/app/lib/types';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, Hash, ChevronLeft, Edit } from 'lucide-react';

export default function EventDetailClient({ event }: { event: IEvent }) {
  const { user, isLoggedIn } = useAuth(); // Get the logged-in user

  // --- 1. THE EDIT LOGIC ---
  const eventDate = new Date(`${event.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight
  
  const isPastEvent = eventDate < today;
  const isOwner = isLoggedIn && user?.clubName === event.clubName;
  console.log(isOwner)
  const canEdit = isOwner && !isPastEvent;
  // --- END OF LOGIC ---

  // Helper to format the date
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-50 min-h-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex justify-between items-center mb-4">
          {/* Back navigation link */}
          <Link 
            href="/main"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Calendar
          </Link>

          {/* --- 2. THE NEW "EDIT EVENT" BUTTON --- */}
          {canEdit && (
            <Link 
              href={`/event/${event.id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
              <Edit className="w-4 h-4" />
              Edit Event
            </Link>
          )}
          {/* --- END OF CHANGE --- */}
        </div>
        
        {/* Main Event Card (The rest is the same as your old page.tsx) */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-blue-600 p-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="w-5 h-5 flex-shrink-0" />
            <Link 
              href={`/club/${event.clubSlug}`}
              className="hover:underline hover:opacity-80 transition-opacity"
            >
              
              {event.clubName}
            </Link>
          </div>
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-lg text-gray-700">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-lg text-gray-700">
                  {event.startTime} – {event.endTime}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-lg text-gray-700">{event.location}</span>
              </div>
            </div>
            <hr className="my-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Event Details
            </h3>
            <p className="text-base text-gray-600 whitespace-pre-line">
              {event.description}
            </p>
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                <Hash className="w-3 h-3" />
                Event ID: {event.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}