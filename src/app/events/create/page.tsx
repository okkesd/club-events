"use client"; // This page must be a Client Component

import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext'; // FIX: Use relative path
import { useRouter } from 'next/navigation';
import { mockCreateEventApi } from '@/app/lib/api'; // FIX: Use relative path
import { CreateEventData } from '@/app/lib/types'; // FIX: Use relative path
import { Loader2, AlertCircle, CalendarPlus, Building } from 'lucide-react';

export default function CreateEventPage() {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Page Protection ---
  // This effect redirects if the user is not logged in
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isAuthLoading, router]);

  // --- Submit Handler ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // This check is required because user can be null
    /*if (!user) {
      setError("User not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }*/

    if (!user || !user.clubSlug) { // <-- 1. ADD A CHECK FOR clubSlug
      setError("User club information is missing. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    // Construct the event object
    // This satisfies Constraint 1: Club name is from the user, not an input.
    const newEventData: CreateEventData = {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      clubName: user.clubName,
      clubSlug: user.clubSlug,
    };

    try {
      // Call the mock API
      const { newEventId } = await mockCreateEventApi(newEventData);
      
      // Success! Redirect to the new event's page
      router.push(`/event/${newEventId}`);

    } catch (err: any) {
      // API call failed
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a loader while auth is checking or if user is not found
  if (isAuthLoading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // --- Render the Form ---
  return (
    <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <h1 className="text-3xl font-bold text-white">
              Create a New Event
            </h1>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6">
            
            {/* Club Name (Read-only) - Constraint 1 */}
            <div>
              <label htmlFor="clubName" className="block text-sm font-medium text-gray-700">
                Club
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="clubName"
                  id="clubName"
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-3 pl-10 text-gray-500 cursor-not-allowed sm:text-sm"
                  value={user.clubName}
                  disabled
                />
              </div>
            </div>

            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Main Auditorium or Online"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Date & Time (Grid) */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start-time"
                  id="start-time"
                  className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  name="end-time"
                  id="end-time"
                  className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={5}
                className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Details about your event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Form Footer (Submit) */}
          <div className="bg-gray-50 px-8 py-4 text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative inline-flex justify-center rounded-md border border-transparent bg-green-600 py-3 px-6 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Create Event
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

