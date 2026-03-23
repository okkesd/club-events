"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin, Users, ChevronLeft, ExternalLink,
  CalendarPlus, Ticket, Edit3, Trash2
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { fetchEventById, updateEvent, deleteEvent, resolveImageUrl } from '@/app/lib/api';
import EventForm from '@/app/components/EventForm';
import { ShareButton } from '@/app/event/[id]/ShareButton';
import { NotifyModal } from '@/app/event/[id]/NotifyModal';
import { EventBrochure } from '@/app/event/[id]/EventBrochure';
import { IEvent } from '@/app/lib/types';
import LikeButton from './LikeButton';

export default function EventDetailClient({ event }: { event: IEvent }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isEventInPast, setIsEventInPast] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  console.log("likes: ",currentEvent.likes)

  // --- AUTH CHECK ---
  const isOwner = user && (user.id === currentEvent.clubId || user.role === 'admin');

  useEffect(() => {
    const eventDate = new Date(event.date + "T00:00:00");
    if (eventDate.getTime() < Date.now()) {
      setIsEventInPast(true);
    }
  }, [])

  // --- HANDLERS ---
  const handleUpdate = async (formData: any) => {
    setIsSubmitting(true);
    try {
        const updated = await updateEvent(currentEvent.id, formData);
        setCurrentEvent(updated);
        setIsEditing(false);
        router.refresh();
    } catch (err) {
        alert("Failed to update event");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(currentEvent.id);
      alert("Event deleted successfully.");
      router.push(`/club/${currentEvent.clubId}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const reFreshData = async () => {
  try {
    const res = await fetchEventById(currentEvent.id);
    if (res) {
      setCurrentEvent(res);
      console.log("Data refreshed:", res); // Add this to verify
    } else {
      throw new Error("Failed to update the event");
    }
  } catch (error) {
    console.error("Refresh error:", error); // Add error logging
  }
};

  // --- VIEW MODE HELPERS ---
  const [year, month, day] = currentEvent.date.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
  const dayNumber = day;
  const weekdayStr = dateObj.toLocaleString('en-US', { weekday: 'long' });
  const hasBrochure = !!currentEvent.coverImage;
  const infoColSpan = hasBrochure ? "lg:col-span-6" : "lg:col-span-9";

  // --- EDIT MODE UI ---
  if (isEditing) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-12 px-4">
             <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => setIsEditing(false)}
                    className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Cancel Editing
                </button>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <EventForm 
                        initialData={currentEvent} 
                        onSubmit={handleUpdate} 
                        onCancel={() => setIsEditing(false)}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </div>
    );
  }

  // --- VIEW MODE UI ---
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Top Nav */}
      <div className="max-w-[1400px] mx-auto mb-6 flex justify-between items-center">
        <Link 
          href="/main"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Calendar
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-sm transition-all
                           bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600
                           dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
                <Edit3 className="w-4 h-4" />
                Edit Event
            </button>
            <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-sm transition-all
                           bg-white text-red-600 border border-gray-200 hover:border-red-400 hover:bg-red-50
                           dark:bg-gray-800 dark:text-red-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:border-red-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. BROCHURE */}
          {hasBrochure && (
            <div className="lg:col-span-3 order-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-8 transition-colors">
                <EventBrochure src={resolveImageUrl(currentEvent.coverImage)} alt={currentEvent.title} />
              </div>
            </div>
          )}

          {/* 2. INFO */}
          <div className={`${infoColSpan} order-2 space-y-6`}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 transition-colors">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors">
                    {currentEvent.title}
                </h1>
                
                <Link 
                    href={`/club/${currentEvent.clubId}`} 
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors">
                        <Users className="w-4 h-4" />
                    </div>
                    <span>
                        Hosted by <span className="underline decoration-dotted text-gray-900 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{currentEvent.clubName}</span>
                    </span>
                </Link>

                <hr className="my-8 border-gray-100 dark:border-gray-800 transition-colors" />
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">About Event</h3>
                
                {/* Prose for rich text handling */}
                <div className="prose prose-blue prose-sm md:prose-base dark:prose-invert text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed max-w-none transition-colors">
                    {currentEvent.description}
                </div>
            </div>
          </div>

          {/* 3. SIDEBAR */}
          <div className="lg:col-span-3 order-3">
            <div className="sticky top-8 space-y-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                    
                    {/* Date Header: Gray-50 -> Gray-800 */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors">
                        <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg w-14 h-14 shadow-sm shrink-0 transition-colors">
                            <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase">{monthName}</span>
                            <span className="text-xl font-extrabold text-gray-900 dark:text-white">{dayNumber}</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase transition-colors">{weekdayStr}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors">
                                {currentEvent.startTime} - {currentEvent.endTime}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 space-y-6">
                        
                        {/* Location */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0 transition-colors">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-0.5 transition-colors">Location</p>
                                <p className="text-sm text-gray-900 dark:text-gray-200 font-semibold leading-snug transition-colors">{currentEvent.location}</p>
                                {currentEvent.locationType === 'off-campus' && (
                                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded mt-1 inline-block transition-colors">Off Campus</span>
                                )}
                            </div>
                        </div>

                        {/* Capacity */}
                        {currentEvent.capacity && (
                             <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 shrink-0 transition-colors">
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-0.5 transition-colors">Capacity</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-semibold leading-snug transition-colors">
                                        Limited to <span className="text-purple-700 dark:text-purple-400">{currentEvent.capacity}</span> spots
                                    </p>
                                </div>
                            </div>
                        )}

                        <hr className="border-gray-100 dark:border-gray-800 transition-colors" />

                        {/* Registration Button Logic */}
                        {!isEventInPast && currentEvent.registrationLink && (
                            currentEvent.isRegistrationOpen ? (
                                <a 
                                    href={currentEvent.registrationLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all gap-2
                                               bg-blue-600 hover:bg-blue-700 text-white
                                               dark:bg-blue-600 dark:hover:bg-blue-500"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Register Now
                                </a>
                            ) : (
                                <button disabled className="flex items-center justify-center w-full py-3.5 px-4 font-bold rounded-xl cursor-not-allowed border
                                                            bg-gray-100 text-gray-400 border-gray-200
                                                            dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 transition-colors">
                                    Registration Closed
                                </button>
                            )
                        )}

                        {/* Actions Grid */}
                        <div className="space-y-3">
                            {/* Updated Grid: 
                                We use a specific layout: Like button is small, Cal & Share are wider.
                                Or simple grid-cols-3 if you want them equal width.
                            */}
                            <div className="flex gap-3">
                                {/* 1. LIKE BUTTON (New) */}
                                <div className="shrink-0">
                                    <LikeButton 
                                        key={`like-${currentEvent.id}-${currentEvent.likes}`}
                                        eventId={currentEvent.id}
                                        initialLikes={currentEvent.likes ?? 0}
                                        reFreshData={reFreshData} />
                                </div>
                        
                                {/* 2. CALENDAR & SHARE (Existing, wrapped in a grid to fill remaining space) */}
                                {!isEventInPast && <div className="grid grid-cols-2 gap-3 flex-grow">
                                    <button className="flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-sm font-semibold transition-colors
                                                       border-gray-200 text-gray-700 hover:bg-gray-50 
                                                       dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                        <CalendarPlus className="w-4 h-4 text-gray-500 dark:text-gray-400" /> 
                                        <span className="hidden sm:inline">Add to Cal</span>
                                        <span className="sm:hidden">Cal</span>
                                    </button>
                                    <ShareButton />
                                </div>}
                            </div>
                            
                            <NotifyModal eventId={currentEvent.id} isEventInPast={isEventInPast}/>
                        </div>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Event</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this event? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50
                           dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700
                           dark:bg-red-600 dark:hover:bg-red-500 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}