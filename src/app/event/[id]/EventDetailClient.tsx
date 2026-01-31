"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Users, ChevronLeft, ExternalLink, 
  CalendarPlus, Ticket, Edit3 
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { updateEvent } from '@/app/lib/api';
import EventForm from '@/app/components/EventForm';
import { ShareButton } from '@/app/event/[id]/ShareButton';
import { NotifyModal } from '@/app/event/[id]/NotifyModal';
import { EventBrochure } from '@/app/event/[id]/EventBrochure';
import { calculateEndTime } from '@/app/lib/timeUtils';

export default function EventDetailClient({ event }: { event: any }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Optimistic UI state
  const [currentEvent, setCurrentEvent] = useState(event);

  // --- AUTH CHECK ---
  const isOwner = user && (user.id === currentEvent.clubID || user.role === 'admin');

  // --- HANDLERS ---
  const handleUpdate = async (formData: any) => {
    setIsSubmitting(true);
    try {
        const updated = await updateEvent(currentEvent.id, formData);
        setCurrentEvent(updated); // Update UI
        setIsEditing(false);      // Exit Edit Mode
        router.refresh();         // Refresh server data
    } catch (err) {
        alert("Failed to update event");
    } finally {
        setIsSubmitting(false);
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
        <div className="max-w-3xl mx-auto py-12 px-4">
             <button 
                onClick={() => setIsEditing(false)}
                className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
             >
                <ChevronLeft className="w-4 h-4" /> Cancel Editing
             </button>
             <EventForm 
                initialData={currentEvent} 
                onSubmit={handleUpdate} 
                onCancel={() => setIsEditing(false)}
                isSubmitting={isSubmitting}
            />
        </div>
    );
  }

  // --- VIEW MODE UI (Your original Layout) ---
  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Nav */}
      <div className="max-w-[1400px] mx-auto mb-6 flex justify-between items-center">
        <Link 
          href="/main"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Calendar
        </Link>

        {/* EDIT BUTTON (Only for Owner) */}
        {isOwner && (
            <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 rounded-xl font-bold shadow-sm transition-all"
            >
                <Edit3 className="w-4 h-4" />
                Edit Event
            </button>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. BROCHURE */}
          {hasBrochure && (
            <div className="lg:col-span-3 order-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                <EventBrochure src={currentEvent.coverImage!} alt={currentEvent.title} />
              </div>
            </div>
          )}

          {/* 2. INFO */}
          <div className={`${infoColSpan} order-2 space-y-6`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                {/* (Tags Logic Here...) */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {currentEvent.title}
                </h1>
                
                <Link href={`/clubs/${currentEvent.clubID}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                    <span>Hosted by <span className="underline decoration-dotted text-gray-900">{currentEvent.clubName}</span></span>
                </Link>

                <hr className="my-8 border-gray-100" />
                <h3 className="text-lg font-bold text-gray-900 mb-4">About Event</h3>
                <div className="prose prose-blue prose-sm md:prose-base text-gray-600 whitespace-pre-line leading-relaxed max-w-none">
                {currentEvent.description}
                </div>
            </div>
          </div>

          {/* 3. SIDEBAR */}
          <div className="lg:col-span-3 order-3">
            <div className="sticky top-8 space-y-4">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg w-14 h-14 shadow-sm shrink-0">
                            <span className="text-[10px] font-bold text-red-500 uppercase">{monthName}</span>
                            <span className="text-xl font-extrabold text-gray-900">{dayNumber}</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">{weekdayStr}</p>
                            <p className="text-sm font-bold text-gray-900">{currentEvent.startTime} - {currentEvent.endTime}</p>
                        </div>
                    </div>

                    <div className="p-5 space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0"><MapPin className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Location</p>
                                <p className="text-sm text-gray-900 font-semibold leading-snug">{currentEvent.location}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                    <CalendarPlus className="w-4 h-4 text-gray-500" /> Add to Cal
                                </button>
                                <ShareButton />
                            </div>
                            <NotifyModal eventId={currentEvent.id} />
                        </div>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}