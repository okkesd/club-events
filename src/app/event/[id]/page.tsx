import React from 'react';
import { fetchEventById } from '@/app/lib/api';
import { IEvent } from '@/app/lib/types';
import { notFound } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, Hash, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

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

  // If no event is found, show a 404 page
  if (!event) {
    notFound();
  }

  // Helper to format the date
  const eventDate = new Date(`${event.date}T00:00:00`); // Use T00:00 to avoid timezone issues
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-50 min-h-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Back navigation link */}
        <Link 
          href="/main"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Calendar
        </Link>
        
        {/* Main Event Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header with club name */}
          <div className="bg-blue-600 p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Users className="w-5 h-5" />
              {event.clubName}
            </h2>
          </div>

          <div className="p-6 md:p-8">
            {/* Event Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

            {/* Main Details (Date, Time, Location) */}
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

            {/* Divider */}
            <hr className="my-6" />

            {/* Description */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Event Details
            </h3>
            <p className="text-base text-gray-600 whitespace-pre-line">
              {event.description}
            </p>

            {/* Event ID Tag (Optional) */}
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