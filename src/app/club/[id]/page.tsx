import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, Instagram, Globe, Linkedin, Calendar, 
  MapPin, ExternalLink, ArrowLeft, Users, Clock, 
  Plus
} from 'lucide-react';
import { fetchClubById, fetchEventsByClubId } from '@/app/lib/api'; 
// Ensure fetchEventsByClubId is imported correctly (check if you renamed it in api.ts)

// --- Helper Components ---
function SocialButton({ icon: Icon, href, label }: { icon: any, href: string, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-colors border border-gray-200"
      title={label}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

function EventCard({ event, isPast = false }: { event: any, isPast?: boolean }) {
    // Quick date parsing
    const dateObj = new Date(event.startDate);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    // Handle timezone offset simply by reading the string directly if needed, 
    // but standard Date works fine if ISO string is correct.
    const day = dateObj.getDate(); 

    return (
        <Link 
            href={`/event/${event.id}`}
            className={`group block bg-white p-4 rounded-xl border transition-all ${
                isPast 
                ? 'border-gray-100 opacity-75 hover:opacity-100 hover:border-gray-300' 
                : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
            }`}
        >
            <div className="flex items-start gap-4">
                {/* Date Badge */}
                <div className={`shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center border transition-colors ${
                    isPast
                    ? 'bg-gray-100 text-gray-500 border-gray-200'
                    : 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                    <span className="text-xs font-bold uppercase">{month}</span>
                    <span className="text-xl font-extrabold">{day}</span>
                </div>

                {/* Event Info */}
                <div>
                    <h4 className={`text-lg font-bold transition-colors ${
                        isPast ? 'text-gray-600' : 'text-gray-900 group-hover:text-blue-700'
                    }`}>
                        {event.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{event.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default async function ClubProfilePage({ params }: { params: Promise<{ id: string }>; }) {
  // Parallel Data Fetching (Faster than awaiting one by one)
  const {id} = await params
  const clubDataPromise = fetchClubById(id);
  const clubEventsPromise = fetchEventsByClubId(id);

  const [club, clubEvents] = await Promise.all([clubDataPromise, clubEventsPromise]);

  if (!club) {
    notFound(); 
  }

  // --- SORTING & FILTERING LOGIC ---
  const eventsList = clubEvents || [];
  
  // 1. Sort all events by Date (Newest to Oldest)
  // Newest = Furthest in Future
  // Oldest = Furthest in Past
  const sortedEvents = [...eventsList].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // 2. Split into Upcoming and Past
  // We use a reference date. In a real app, this is new Date(). 
  // Since your mock data is 2026, real 'now' might show everything as upcoming.
  // For logic demonstration, I'll use standard new Date().
  const now = new Date();
  
  // Filter
  const upcomingEvents = sortedEvents.filter(e => new Date(e.startDate) >= now);
  const pastEvents = sortedEvents.filter(e => new Date(e.startDate) < now);

  // Optional: You might want upcoming events sorted "Soonest to Furthest" (Ascending)
  // while keeping Past events "Recent to Oldest" (Descending).
  // If you strictly want "Newest to Oldest" for EVERYTHING as requested, keep the sort above.
  // I will reverse 'upcoming' so the one happening *tomorrow* is at the top, not the one next year.
  // This is better UX. 
  const upcomingSorted = [...upcomingEvents].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());


  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* --- HERO HEADER (Existing Code) --- */}
      <div className="bg-white shadow-sm mb-6">
        <div className="relative h-48 md:h-64 w-full bg-gray-900 overflow-hidden">
          {club.banner ? (
            <img 
              src={club.banner} 
              alt="Club Banner" 
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900" />
          )}
          <Link 
            href="/main"
            className="absolute top-4 left-4 bg-white/90 backdrop-blur hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 mb-6 gap-6 relative z-10">
            <div className="bg-white p-1.5 rounded-2xl shadow-lg shrink-0">
              <img 
                src={club.logo || "https://via.placeholder.com/150"} 
                alt={club.clubName} 
                className="w-28 h-28 md:w-40 md:h-40 rounded-xl object-cover bg-gray-100 border border-gray-100"
              />
            </div>
            <div className="flex-1 w-full pt-2 md:pt-0 md:mb-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                            {club.category}
                        </span>
                        {club.foundedYear && (
                            <span className="text-xs text-gray-500 font-medium">Est. {club.foundedYear}</span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        {club.clubName}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {club.socials?.instagram && <SocialButton icon={Instagram} href={club.socials.instagram} label="Instagram" />}
                    {club.socials?.linkedin && <SocialButton icon={Linkedin} href={club.socials.linkedin} label="LinkedIn" />}
                    {club.socials?.website && <SocialButton icon={Globe} href={club.socials.website} label="Website" />}
                    {/* NEW: Create Button (Secondary Action) */}
                    <Link 
                        href={`/event/create?preselect=${club.id}`}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition-all hover:bg-gray-50 hover:border-gray-300 ml-4"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Post Event</span>
                    </Link>
                    <a href={`mailto:${club.clubMail}`} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md ml-2">
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Contact</span>
                    </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: About & Events */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About Us</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                    {club.description}
                </p>
            </div>

            {/* Events List */}
            <div>
                {/* UPCOMING EVENTS HEADER */}
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    Hosted Events
                </h3>
                
                {upcomingSorted.length > 0 ? (
                    <div className="space-y-4 mb-8">
                        {upcomingSorted.map(event => (
                            <EventCard key={event.id} event={event} isPast={false} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300 mb-8">
                        <p className="text-gray-500 font-medium">No upcoming events scheduled.</p>
                    </div>
                )}

                {/* PAST EVENTS SECTION */}
                {pastEvents.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-t border-gray-200 pt-8">
                            <Clock className="w-5 h-5" />
                            Past Events
                        </h3>
                        <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                            {pastEvents.map(event => (
                                <EventCard key={event.id} event={event} isPast={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* RIGHT: Sidebar Info (Existing Code) */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Club Details</h3>
                <div className="space-y-5">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Mail className="w-4 h-4" /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-0.5">Email</p>
                            <a href={`mailto:${club.clubMail}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 break-all">{club.clubMail}</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Users className="w-4 h-4" /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-0.5">Membership</p>
                            <p className="text-sm font-semibold text-gray-900">Open to all students</p>
                        </div>
                    </div>
                    <div className="pt-6 mt-2 border-t border-gray-100">
                        <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Visit Official Website
                        </button>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}