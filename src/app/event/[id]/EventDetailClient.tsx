"use client";
import {useUI} from "@/i18n/useUI";


import SourcePostButton from "@/app/components/SourcePostButton";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin, Users, ChevronLeft, ExternalLink,
  CalendarPlus, Ticket, Edit3, Trash2, Eye
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { updateEvent, deleteEvent, resolveImageUrl } from '@/app/lib/api';
import EventForm from '@/app/components/EventForm';
import { ShareButton } from '@/app/event/[id]/ShareButton';
import { NotifyModal } from '@/app/event/[id]/NotifyModal';
import { EventBrochure } from '@/app/event/[id]/EventBrochure';
import { IEvent } from '@/app/lib/types';
import LikeButton from './LikeButton';
import EventDescription from './EventDescription';
import { downloadEventCalendar } from '@/app/lib/calendarExport';

export default function EventDetailClient({ event }: { event: IEvent }) {
  const {t, locale} = useUI();
  const router = useRouter();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isEventInPast, setIsEventInPast] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExternalLinkModal, setShowExternalLinkModal] = useState(false);
  const [calendarError, setCalendarError] = useState(false);

  // --- AUTH CHECK ---
  const isOwner = user && (user.id === currentEvent.clubId || user.role === 'admin');

  useEffect(() => {
    const eventDate = new Date(currentEvent.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setIsEventInPast(eventDate.getTime() < today.getTime());
  }, [currentEvent.date])

  // --- HANDLERS ---
  const handleCalendarDownload = () => {
    setCalendarError(false);
    try {
      downloadEventCalendar(currentEvent);
    } catch {
      setCalendarError(true);
    }
  };

  const handleUpdate = async (formData: any) => {
    setIsSubmitting(true);
    try {
        const res = await updateEvent(currentEvent.id, formData);
        // The API returns an envelope; the event itself is under .data.
        if (!res.data) throw new Error(res.errorMsg || "Update returned no event");
        setCurrentEvent(res.data);
        setIsEditing(false);
        router.refresh();
    } catch (err) {
        alert(t("Failed to update event"));
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(currentEvent.id);
      alert(t("Event deleted successfully."));
      router.push(`/club/${currentEvent.clubId}`);
      router.refresh();
    } catch (err: any) {
      alert(t("Failed to delete event"));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // --- VIEW MODE HELPERS ---
  const [year, month, day] = currentEvent.date.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const monthName = dateObj.toLocaleString(locale, { month: 'short' });
  const dayNumber = day;
  const weekdayStr = dateObj.toLocaleString(locale, { weekday: 'long' });
  const hasBrochure = !!currentEvent.coverImage;
  const infoColSpan = hasBrochure ? "lg:col-span-6" : "lg:col-span-9";

  // --- EDIT MODE UI ---
  if (isEditing) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent transition-colors py-12 px-4">
             <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => setIsEditing(false)}
                    className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300 vibrant:text-campus-muted hover:text-gray-900 dark:hover:text-white vibrant:hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />  {t("Cancel Editing")}</button>
                <div className="bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 vibrant:border-campus-border p-6 transition-colors">
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
    <div className="bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Top Nav */}
      <div className="max-w-[1400px] mx-auto mb-6 flex justify-between items-center">
        <Link 
          href="/main"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 vibrant:text-campus-muted hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("Back to Calendar")}</Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-sm transition-all
                           bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600
                           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-blue-300
                           vibrant:bg-white/80 vibrant:text-campus-ink vibrant:border-campus-border vibrant:hover:border-campus-gold vibrant:hover:text-gray-900"
            >
                <Edit3 className="w-4 h-4" />
                {t("Edit Event")}</button>
            <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-sm transition-all
                           bg-white text-red-600 border border-gray-200 hover:border-red-400 hover:bg-red-50
                           dark:bg-gray-800 dark:text-red-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:border-red-500
                           vibrant:bg-white/80 vibrant:text-campus-ink vibrant:border-campus-border vibrant:hover:border-campus-gold vibrant:hover:bg-campus-surface
                           disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? t("Deleting...") : t("Delete")}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. BROCHURE */}
          {hasBrochure && (
            <div className="lg:col-span-3 order-1">
              <div className="bg-white dark:bg-gray-800 vibrant:bg-white/80 vibrant:backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 vibrant:border-campus-border overflow-hidden sticky top-8 transition-colors">
                <EventBrochure src={resolveImageUrl(currentEvent.coverImage)} alt={currentEvent.title} />
              </div>
            </div>
          )}

          {/* 2. INFO */}
          <div className={`${infoColSpan} min-w-0 order-2 space-y-6`}>
            <div className="bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 vibrant:border-campus-border p-6 md:p-8 transition-colors">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white vibrant:text-gray-900 mb-4 leading-tight transition-colors">
                    {currentEvent.title}
                </h1>
                {currentEvent.organizerInstagram && (
                <a
                    href={`https://www.instagram.com/${encodeURIComponent(currentEvent.organizerInstagram)}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 vibrant:text-campus-muted hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-gray-900 font-medium transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 vibrant:bg-campus-soft flex items-center justify-center transition-colors">
                        <Users className="w-4 h-4" />
                    </div>
                    <span>
                        {t("Hosted by")} <span className="underline decoration-dotted text-gray-900 dark:text-gray-100 vibrant:text-gray-900 hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-campus-accent transition-colors">@{currentEvent.organizerInstagram}</span>
                    </span>
                </a>
                )}

                <hr className="my-8 border-gray-100 dark:border-gray-800 vibrant:border-campus-border transition-colors" />
                
                <EventDescription eventId={currentEvent.id} description={currentEvent.description} />
                <SourcePostButton url={currentEvent.sourcePostUrl} />
            </div>
          </div>

          {/* 3. SIDEBAR */}
<div className="lg:col-span-3 order-3">
    <div className="sticky top-8 space-y-4">
        {/* Main Card Container */}
        <div className="rounded-2xl shadow-lg border overflow-hidden transition-colors
                        bg-white border-gray-100 
                        dark:bg-gray-900 dark:border-gray-800 
                        vibrant:bg-white vibrant:border-campus-border vibrant:shadow-stone-400/10">
            
            {/* Date Header */}
            <div className="p-4 border-b flex items-center gap-4 transition-colors
                            bg-gray-50 border-gray-100 
                            dark:bg-gray-800 dark:border-gray-700
                            vibrant:bg-campus-surface/50 vibrant:border-campus-border">
                {/* Date Square */}
                <div className="flex flex-col items-center justify-center rounded-lg w-14 h-14 shadow-sm shrink-0 transition-colors border
                                bg-white border-gray-200 
                                dark:bg-gray-900 dark:border-gray-700
                                vibrant:bg-white vibrant:border-campus-border">
                    <span className="text-[10px] font-bold uppercase
                                     text-red-500 dark:text-red-400 vibrant:text-campus-muted">{monthName}</span>
                    <span className="text-xl font-extrabold 
                                     text-gray-900 dark:text-white vibrant:text-gray-900">{dayNumber}</span>
                </div>
                <div>
                    <p className="text-xs font-medium uppercase transition-colors
                                  text-gray-500 dark:text-gray-300 vibrant:text-campus-muted">{weekdayStr}</p>
                    <p className="text-sm font-bold transition-colors
                                  text-gray-900 dark:text-white vibrant:text-gray-950">
                        {currentEvent.startTime} - {currentEvent.endTime}
                    </p>
                </div>
            </div>

            <div className="p-5 space-y-6">
                
                {/* Location */}
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg shrink-0 transition-colors
                                    bg-blue-50 text-blue-600 
                                    dark:bg-blue-900/20 dark:text-blue-300
                                    vibrant:bg-campus-soft vibrant:text-campus-ink">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase mb-0.5 transition-colors
                                      text-gray-500 dark:text-gray-300 vibrant:text-campus-muted">{t("Location")}</p>
                        <p className="text-sm font-semibold leading-snug transition-colors
                                      text-gray-900 dark:text-gray-100 vibrant:text-gray-900">{currentEvent.location}</p>
                        {currentEvent.locationType === 'off-campus' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block transition-colors
                                             bg-orange-100 text-orange-700 
                                             dark:bg-orange-900/30 dark:text-orange-400
                                             vibrant:bg-campus-soft vibrant:text-campus-ink">{t("Off Campus")}</span>
                        )}
                    </div>
                </div>

                {/* Capacity */}
                {currentEvent.isRegistrationOpen && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg shrink-0 transition-colors
                                        bg-purple-50 text-purple-600 
                                        dark:bg-purple-900/20 dark:text-purple-400
                                        vibrant:bg-campus-surface vibrant:text-campus-ink">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase mb-0.5 transition-colors
                                          text-gray-500 dark:text-gray-300 vibrant:text-campus-muted">
                                {t("Capacity")}</p>
                            <p className="text-sm font-semibold leading-snug transition-colors
                                          text-gray-900 dark:text-gray-100 vibrant:text-gray-900">
                                {currentEvent.capacity && currentEvent.capacity > 0 ? (
                                    <>
                                        {t("Limited to {count} spots", {count: currentEvent.capacity})}</>
                                ) : (
                                    <span className="text-purple-700 dark:text-purple-400 vibrant:text-campus-ink">{t("Unlimited spots")}</span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* View Count */}
                {currentEvent.viewCount > 0 && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg shrink-0 transition-colors
                                        bg-gray-50 text-gray-500 
                                        dark:bg-gray-800 dark:text-gray-300
                                        vibrant:bg-campus-surface vibrant:text-campus-muted">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase mb-0.5 transition-colors
                                          text-gray-500 dark:text-gray-300 vibrant:text-campus-muted">{t("Views")}</p>
                            <p className="text-sm font-semibold leading-snug transition-colors
                                          text-gray-900 dark:text-gray-100 vibrant:text-gray-900">
                                {currentEvent.viewCount.toLocaleString(locale)}
                            </p>
                        </div>
                    </div>
                )}

                        <hr className="border-gray-100 dark:border-gray-800 vibrant:border-campus-border transition-colors" />

                        {/* Registration Button Logic */}

{!isEventInPast && currentEvent.registrationLink && (
    currentEvent.isRegistrationOpen ? (
        <button 
            onClick={() => setShowExternalLinkModal(true)}
            className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all gap-2
                       bg-blue-600 hover:bg-blue-700 text-white
                       dark:bg-blue-600 dark:hover:bg-blue-500
                       vibrant:bg-gradient-to-r vibrant:from-campus-accent vibrant:to-campus-accent vibrant:hover:from-campus-accent-dark vibrant:hover:to-campus-accent-dark vibrant:text-white vibrant:shadow-stone-400/25"
        >
            <ExternalLink className="w-5 h-5" />
            {t("Register Now")}</button>
    ) : (
        <button disabled className="flex items-center justify-center w-full py-3.5 px-4 font-bold rounded-xl cursor-not-allowed border transition-colors
                                    bg-gray-100 text-gray-400 border-gray-200
                                    dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 
                                    vibrant:bg-campus-surface/50 vibrant:text-campus-muted vibrant:border-campus-border">
            {t("Registration Closed")}</button>
    )
)}

                        {/* Actions Grid */}
                <div className="space-y-3">
                    <div className="flex gap-3">
                        {/* 1. LIKE BUTTON */}
                        <div className="shrink-0">
                            <LikeButton
                                key={`like-${currentEvent.id}-${currentEvent.likes}`}
                                eventId={currentEvent.id}
                                initialLikes={currentEvent.likes ?? 0}
                                initialHasLiked={currentEvent.hasLiked ?? false} />
                        </div>
                
                        {/* 2. CALENDAR & SHARE */}
                        {!isEventInPast && <div className="grid grid-cols-2 gap-3 flex-grow">
                            <button type="button" onClick={handleCalendarDownload} aria-label={t("Add to Cal")} className="flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-sm font-semibold transition-colors
                                               border-gray-200 text-gray-700 hover:bg-gray-50 
                                               dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800
                                               vibrant:border-campus-border vibrant:text-campus-ink vibrant:hover:bg-campus-surface">
                                <CalendarPlus className="w-4 h-4 text-gray-500 dark:text-gray-300 vibrant:text-campus-muted" /> 
                                <span className="hidden sm:inline">{t("Add to Cal")}</span>
                                <span className="sm:hidden">{t("Cal")}</span>
                            </button>
                            {/* Assuming ShareButton internally accepts classes or you will style it similarly */}
                            <ShareButton title={currentEvent.title} />
                        </div>}
                    </div>
                    
                    {calendarError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t("Could not download the calendar file. Please try again.")}</p>}
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
          <div className="bg-white dark:bg-gray-900 vibrant:bg-white vibrant:border-campus-border rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white vibrant:text-gray-950 mb-2">{t("Delete Event")}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 vibrant:text-campus-ink mb-6">
              {t("Are you sure you want to delete this event? This cannot be undone.")}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50
                           dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800
                           vibrant:border-campus-border vibrant:text-campus-ink vibrant:hover:bg-campus-surface transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("Cancel")}</button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700
                           dark:bg-red-600 dark:hover:bg-red-500 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? t("Deleting...") : t("Yes, Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* External Link Confirmation Modal */}
{showExternalLinkModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
        <div className="rounded-2xl p-6 max-w-md w-full shadow-2xl border animate-in fade-in zoom-in-95 duration-200
                        bg-white border-gray-200 
                        dark:bg-gray-800 dark:border-gray-700 
                        vibrant:bg-white vibrant:border-campus-border vibrant:shadow-stone-900/10">
            
            <h3 className="text-xl font-bold mb-2
                           text-gray-900 dark:text-white vibrant:text-gray-950">
                {t("Leaving eventmnts")}</h3>
            
            <p className="mb-4 text-sm leading-relaxed
                          text-gray-600 dark:text-gray-200 vibrant:text-campus-ink">
                {t("You are about to be redirected to an external website for registration. Do you trust this link?")}</p>
            
            {/* Link Container */}
            <div className="p-3 rounded-xl mb-6 break-all border 
                            bg-gray-50 border-gray-100 
                            dark:bg-gray-900 dark:border-gray-700
                            vibrant:bg-campus-surface vibrant:border-campus-border">
                <span className="text-sm font-medium
                                 text-blue-600 dark:text-blue-300 vibrant:text-campus-ink">
                    {currentEvent.registrationLink}
                </span>
            </div>
            
            <div className="flex gap-3 justify-end">
                {/* Cancel Button */}
                <button 
                    onClick={() => setShowExternalLinkModal(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold transition-colors
                               bg-gray-100 text-gray-700 hover:bg-gray-200 
                               dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 
                               vibrant:bg-campus-soft vibrant:text-campus-ink vibrant:hover:bg-campus-soft"
                >
                    {t("Cancel")}</button>
                
                {/* Confirm Link */}
                <a 
                    href={currentEvent.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowExternalLinkModal(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold text-white text-center transition-colors
                               bg-blue-600 hover:bg-blue-700 
                               dark:bg-blue-600 dark:hover:bg-blue-500 
                               vibrant:bg-gradient-to-r vibrant:from-campus-accent vibrant:to-campus-accent vibrant:hover:from-campus-accent-dark vibrant:hover:to-campus-accent-dark"
                >
                    {t("Yes, take me to the link")}</a>
            </div>
            
        </div>
    </div>
)}
    </div>
    
  );
}
