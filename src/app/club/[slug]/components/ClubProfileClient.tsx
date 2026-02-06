"use client";

import React, { useState, useMemo } from 'react';
import { IClubPageData, IEvent } from '@/app/lib/types';
import { Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

/**
 * A simple card for displaying past/upcoming events
 */
function SmallEventCard({ event }: { event: IEvent }) {
  return (
    <Link 
      href={`/event/${event.id}`}
      className="block p-4 rounded-lg bg-gray-50 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold text-blue-700">{event.title}</h3>
      <p className="text-sm text-gray-600 mb-2">
        {new Date(event.date).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        })}
        {' | '}
        {event.startTime} - {event.endTime}
      </p>
      <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
    </Link>
  );
}

/**
 * Client Component for the Club Profile
 * Handles tabs and event sorting
 */
export default function ClubProfileClient({ data }: { data: IClubPageData }) {
  const [activeTab, setActiveTab] = useState<'about' | 'events'>('about');
  const { club, events } = data;
  const { user } = useAuth();

  // Memoize event sorting to avoid re-calculating on every render
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    // Set time to 00:00:00 to compare dates only
    now.setHours(0, 0, 0, 0); 

    const upcoming: IEvent[] = [];
    const past: IEvent[] = [];

    events.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    // Sort upcoming (soonest first) and past (most recent first)
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* --- Section 1: Hero Header --- */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-12 mb-8">
        <div className="flex flex-col sm:flex-row items-center p-8">
          <img 
            src={club.logoUrl} 
            alt={`${club.name} logo`}
            className="w-32 h-32 rounded-full border-4 border-blue-500"
          />
          <div className="ml-0 sm:ml-8 mt-4 sm:mt-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-4xl font-bold text-gray-900">{club.name}</h1>
              
              {/* This is the new "Your Club" badge */}
              {user && user.clubName === club.name && (
                <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                  Your Club!
                </span>
              )}
            </div>
            
            <p className="text-lg text-gray-600 mt-2">
              Run by {club.leaderName}
            </p>
            <a 
              href={`mailto:${club.contactEmail}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-2"
            >
              <Mail className="w-4 h-4" />
              {club.contactEmail}
            </a>
          </div>
        </div>
      </div>

      {/* --- Section 2: Tabbed Navigation --- */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 -mb-px">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-4 px-1 text-lg font-medium ${
              activeTab === 'about'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-4 px-1 text-lg font-medium ${
              activeTab === 'events'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Events ({events.length})
          </button>
        </nav>
      </div>

      {/* --- Section 3: Tab Content --- */}
      <div className="py-10">
        {/* "About" Tab Content */}
        {activeTab === 'about' && (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Club Purpose
            </h2>
            <p className="text-base text-gray-600 whitespace-pre-line">
              {club.purpose}
            </p>
          </div>
        )}

        {/* "Events" Tab Content */}
        {activeTab === 'events' && (
          <div className="space-y-10">
            {/* Upcoming Events */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Upcoming Events ({upcomingEvents.length})
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingEvents.map(event => (
                    <SmallEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming events scheduled.</p>
              )}
            </div>

            {/* Past Events */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Past Events ({pastEvents.length})
              </h2>
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastEvents.map(event => (
                    <SmallEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No past events found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}