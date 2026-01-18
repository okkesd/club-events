// app/event/[id]/page.tsx
import React from 'react';
import { fetchClubById, fetchEventById } from '@/app/lib/api';
import {calculateEndTime} from '@/app/lib/timeUtils'
import { notFound } from 'next/navigation';
import { 
  MapPin, Users, ChevronLeft, 
  ExternalLink, CalendarPlus, Ticket 
} from 'lucide-react';
import Link from 'next/link';
import { ShareButton } from '@/app/event/[id]/ShareButton';
import { NotifyModal } from '@/app/event/[id]/NotifyModal'; // Import the new modal
import { EventBrochure } from '@/app/event/[id]/EventBrochure';

type EventPageProps = {
  params: Promise<{ id: string }>;
};


function getGoogleCalendarLink(event: any) {
  
  const end_time = calculateEndTime(event.startTime, event.duration)

  //console.log(`${event.year}-${event.month < 10 ? '0'+String(event.month): event.month}-${event.day < 10 ? '0'+String(event.day) : event.day}T${event.startTime}:00.000Z`)
  const start = new Date(`${event.startDate}T${event.startTime}:00.000Z`).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(`${event.startDate}T${end_time}:00.000Z`).toISOString().replace(/-|:|\.\d\d\d/g, "");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await fetchEventById(id);
  console.log(event)
  if (!event) notFound();
  //const club = await fetcClubById(event.clubID)
  //if (!club) notFound();


  const [year, month, day] = event.startDate.split('-');

// 2. Create a Local Date object (Safe from timezone shifts)
// Note: Month is 0-indexed in JS Date (0 = Jan), so we subtract 1
const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

// 3. Get the strings
const monthName = dateObj.toLocaleString('en-US', { month: 'short' }); // "Jan"
const dayNumber = day; // "18"
const weekdayStr = dateObj.toLocaleString('en-US', { weekday: 'long' }); // "Sunday"

  // Formatting
  const eventDate = event.startDate //new Date(`${event.year}-${event.month < 10 ? '0'+String(event.month): event.month}-${event.day < 10 ? '0'+String(event.day) : event.day}T00:00:00`);
  const eventEndTime = calculateEndTime(event.startTime, event.duration)
  //const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  //const weekdayStr = new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long' });
  const googleCalLink = getGoogleCalendarLink(event);

  // Layout Logic:
  // If brochure exists: Brochure(3) | Info(6) | Sidebar(3)
  // If NO brochure: Info(9) | Sidebar(3)
  const hasBrochure = !!event.coverImage;
  const infoColSpan = hasBrochure ? "lg:col-span-6" : "lg:col-span-9";

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Nav */}
      <div className="max-w-[1400px] mx-auto mb-6">
        <Link 
          href="/main"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Calendar
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- 1. BROCHURE COLUMN (Left Wall) --- */}
          {hasBrochure && (
            <div className="lg:col-span-3 order-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                
                {/* Replaced static <img> with Client Component */}
                <EventBrochure
                  src={event.coverImage!} 
                  alt={event.title} 
                />
                
              </div>
            </div>
          )}

          {/* --- 2. INFO COLUMN (Middle/Left) --- */}
          <div className={`${infoColSpan} order-2 space-y-6`}>
            
            {/* Main Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                {/* Tags */}
                {event.tags && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {event.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                        {tag}
                    </span>
                    ))}
                    {event.capacity && (
                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        {event.capacity} Spots
                    </span>
                    )}
                </div>
                )}

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {event.title}
                </h1>
                
                <Link 
                    href={`/clubs/${encodeURIComponent(event.clubID)}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                    </div>
                    <span>Hosted by <span className="underline decoration-dotted text-gray-900">{event.clubName}</span></span>
                </Link>

                <hr className="my-8 border-gray-100" />

                <h3 className="text-lg font-bold text-gray-900 mb-4">About Event</h3>
                <div className="prose prose-blue prose-sm md:prose-base text-gray-600 whitespace-pre-line leading-relaxed max-w-none">
                {event.description}
                </div>
            </div>
          </div>

          {/* --- 3. SIDEBAR COLUMN (Right Wall) --- */}
<div className="lg:col-span-3 order-3">
  <div className="sticky top-8 space-y-4"> {/* Added 'sticky' for better UX */}
    
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-4">
        
        {/* Date Box */}
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg w-14 h-14 shadow-sm shrink-0">
          {/* FIXED: Use calculated monthName */}
          <span className="text-[10px] font-bold text-red-500 uppercase">
            {monthName}
          </span>
          {/* FIXED: Use parsed dayNumber */}
          <span className="text-xl font-extrabold text-gray-900">
            {dayNumber}
          </span>
        </div>

        <div>
          {/* Weekday */}
          <p className="text-xs text-gray-500 font-medium uppercase">
            {weekdayStr}
          </p>
          {/* Time */}
          <p className="text-sm font-bold text-gray-900">
            {event.startTime} - {event.endTime} {/* Make sure to use event.endTime */}
          </p>
        </div>
      </div>

                <div className="p-5 space-y-6">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Location</p>
                      <p className="text-sm text-gray-900 font-semibold leading-snug">{event.location}</p>
                      {event.locationType === 'off-campus' && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Get Directions
                        </a>
                      )}
                      {event.locationType === 'on-campus' && (
                        <span className="text-xs text-gray-400 mt-1 inline-block">
                          On Campus
                        </span>
                      )}
                    </div>
                  </div>

                  {/* REGISTER BUTTON */}
                  {event.registrationLink && event.isRegistrationOpen ? (
                    <a 
                      href={event.registrationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Register Now
                    </a>
                  ) : (
                    /* Optional: Show a "Closed" state if link exists but closed */
                    event.registrationLink && !event.isRegistrationOpen && (
                      <button disabled className="w-full py-3 px-4 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed border border-gray-200">
                        Registration Closed
                      </button>
                    )
                  )}

                  {/* Actions Grid */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <a 
                        href={googleCalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                        <CalendarPlus className="w-4 h-4 text-gray-500" />
                        Add to Cal
                        </a>
                        
                        <ShareButton />
                    </div>
                    
                    {/* Notify Me Button (Full Width) */}
                    <NotifyModal eventId={event.id} />
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