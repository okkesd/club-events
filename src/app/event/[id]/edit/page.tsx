"use client"; // This page must be a Client Component

import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, useParams } from 'next/navigation'; // <-- Import useParams
import { mockUpdateEventApi, fetchEventById } from '@/app/lib/api'; // <-- Import new functions
import { UpdateEventData, IEvent } from '@/app/lib/types'; // <-- Import IEvent
import { Loader2, AlertCircle, Edit, Building } from 'lucide-react';

export default function EditEventPage() {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams(); // Hook to get URL params
  const eventId = params.id as string; // Get the event ID (e.g., "evt-1")

  // --- Form State ---
  const [eventData, setEventData] = useState<IEvent | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  // --- Page State ---
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- 1. Data Fetching Effect ---
  // Runs once to load the event data into the form
  useEffect(() => {
    if (!eventId) return; // Don't fetch if ID isn't ready

    const loadEvent = async () => {
      try {
        const event = await fetchEventById(eventId);
        if (!event) {
          setError("Event not found.");
          return;
        }
        
        // --- 2. ACCESS CONTROL (Frontend) ---
        // This is the UI check. The *real* check is in the API.
        if (!user || user.clubName !== event.clubName) {
          setError("You do not have permission to edit this event.");
          router.push(`/event/${eventId}`); // Redirect
          return;
        }

        // --- 3. PRE-POPULATE FORM ---
        setEventData(event);
        setTitle(event.title);
        setDescription(event.description);
        setDate(event.date);
        setStartTime(event.startTime);
        setEndTime(event.endTime);
        setLocation(event.location);

      } catch (err) {
        setError("Failed to load event data.");
      } finally {
        setIsLoadingEvent(false);
      }
    };
    
    // Only run this fetch *after* auth is loaded
    if (!isAuthLoading) {
      loadEvent();
    }

  }, [eventId, user, isAuthLoading, router]);

  // --- 4. Submit Handler (Updated) ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!user || !eventData) {
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Construct the *update* object
    const updatedData: UpdateEventData = {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
    };

    try {
      // Call the new update API
      await mockUpdateEventApi(eventData.id, updatedData);
      
      // Success! Redirect back to the event's page
      router.push(`/event/${eventData.id}`);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a full-page loader while auth OR event data is loading
  if (isAuthLoading || isLoadingEvent) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }
  
  // If user isn't logged in or event failed to load, show error
  if (!user || !eventData) {
     return (
       <div className="flex-grow flex flex-col items-center justify-center text-red-600">
         <AlertCircle className="w-12 h-12 mb-4" />
         <h2 className="text-2xl font-semibold">Access Denied</h2>
         <p>{error || "You must be logged in to view this page."}</p>
       </div>
     );
  }

  // --- 5. Render the Form (mostly the same as Create Page) ---
  return (
    <div className="flex-grow text-black bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <h1 className="text-3xl font-bold text-white">
              Edit Event
            </h1>
          </div>

          {/* Form Body (inputs are the same, just pre-filled) */}
          <div className="p-8 space-y-6">
            
            {/* Club Name (Read-only) */}
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
                  value={eventData.clubName} // From the loaded event data
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                  Saving Changes...
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}