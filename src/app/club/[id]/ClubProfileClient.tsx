"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, Instagram, Globe, Linkedin, Calendar, 
  MapPin, ExternalLink, ArrowLeft, Users, Clock, 
  Plus, Camera, Save, X, Edit3, 
  LogOut
} from 'lucide-react';
import { updateClub, uploadImage } from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/context/AuthContext";

// --- Helper Components ---
function SocialButton({ icon: Icon, href, label }: { icon: any, href: string, label: string }) {
  if (!href) return null;
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-colors border border-gray-200
                 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
      title={label}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

function EventCard({ event, isPast = false }: { event: any, isPast?: boolean }) {
    const dateObj = new Date(event.date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate(); 

    return (
        <Link 
            href={`/event/${event.id}`}
            className={`group block bg-white p-4 rounded-xl border transition-all duration-300
                dark:bg-gray-900 dark:border-gray-800
                ${isPast 
                ? 'border-gray-100 opacity-75 hover:opacity-100 hover:border-gray-300 dark:opacity-50 dark:hover:opacity-100 dark:hover:border-gray-600' 
                : 'border-gray-200 hover:border-blue-400 hover:shadow-md dark:hover:border-blue-500/50 dark:hover:shadow-blue-900/10'
            }`}
        >
            <div className="flex items-start gap-4">
                {/* Date Box */}
                <div className={`shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center border transition-colors
                    ${isPast
                    ? 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                    : 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40 dark:group-hover:bg-blue-600 dark:group-hover:text-white'
                }`}>
                    <span className="text-xs font-bold uppercase">{month}</span>
                    <span className="text-xl font-extrabold">{day}</span>
                </div>
                
                {/* Content */}
                <div>
                    <h4 className={`text-lg font-bold transition-colors ${
                        isPast 
                        ? 'text-gray-600 dark:text-gray-500' 
                        : 'text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-400'
                    }`}>
                        {event.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-2">
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

// --- MAIN CLIENT COMPONENT ---
export default function ClubProfileClient({ initialClub, events }: { initialClub: any, events: any[] }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  // 1. STATE
  const [club, setClub] = useState(initialClub);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    clubName: initialClub.clubName,
    description: initialClub.description,
    email: initialClub.email,
    banner_url: initialClub.bannerUrl,
    logo_url: initialClub.logoUrl,
  });

  const isOwner = user && user.id === club.id;

  // 3. HANDLERS
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'banner_url' | 'logo_url') => {
    if (e.target.files?.[0]) {
      const url = await uploadImage(e.target.files[0]);
      if (url) setFormData(prev => ({ ...prev, [field]: url }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const response = await updateClub(club.id, formData);
        if (response.success) {
            setClub(response.data); 
            setIsEditing(false);
        }
    } catch (error) {
        alert("Failed to save changes.");
        console.error(error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
        clubName: club.clubName,
        description: club.description,
        email: club.email,
        banner_url: club.bannerUrl,
        logo_url: club.logoUrl,
    });
    setIsEditing(false);
  };

  // --- SORTING LOGIC ---
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const now = new Date();
  const upcomingEvents = sortedEvents.filter(e => new Date(e.date) >= now)
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = sortedEvents.filter(e => new Date(e.date) < now);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-20 transition-colors duration-300">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-white dark:bg-gray-900 shadow-sm mb-6 transition-colors">
        
        {/* BANNER AREA */}
        <div className="relative h-48 md:h-64 w-full bg-gray-900 dark:bg-black overflow-hidden group">
          {formData.banner_url ? (
            <img 
              src={formData.banner_url} 
              alt="Club Banner" 
              className={`w-full h-full object-cover transition-opacity ${isEditing ? 'opacity-60' : 'opacity-90'}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-indigo-950" />
          )}
          
          {/* Back Button */}
          <Link 
            href="/main"
            className="absolute top-4 left-4 bg-white/90 dark:bg-black/50 backdrop-blur hover:bg-white dark:hover:bg-black/70 
                       text-gray-800 dark:text-white px-3 py-1.5 rounded-lg text-sm font-semibold 
                       flex items-center gap-2 transition-all shadow-sm z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          {/* EDIT: Banner Upload Button */}
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 hover:bg-black/50 transition-colors z-20">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-900 dark:text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors">
                    <Camera className="w-5 h-5" />
                    Change Banner
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner_url')} />
            </label>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 mb-6 gap-6 relative z-10">
            
            {/* LOGO AREA */}
            <div className="bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-lg shrink-0 relative group transition-colors">
              <img 
                src={formData.logo_url || "https://via.placeholder.com/150"} 
                alt="Club Logo" 
                className="w-28 h-28 md:w-40 md:h-40 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-colors"
              />
              {/* EDIT: Logo Upload Button */}
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-2xl bg-black/40 hover:bg-black/50 transition-colors z-20">
                    <Camera className="w-6 h-6 text-white drop-shadow-md" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_url')} />
                </label>
              )}
            </div>

            <div className="flex-1 w-full pt-2 md:pt-0 md:mb-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase tracking-wide transition-colors">
                            {club.category || "Club"}
                        </span>
                    </div>
                    
                    {/* EDIT: Title Input vs Text */}
                    {isEditing ? (
                        <input 
                            type="text"
                            value={formData.clubName}
                            onChange={(e) => setFormData({...formData, clubName: e.target.value})}
                            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-500 focus:outline-none bg-transparent w-full transition-colors"
                        />
                    ) : (
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight transition-colors">
                            {club.clubName}
                        </h1>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* OWNER ONLY: Edit Button */}
                            {isOwner && (
                                <>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 px-4 py-2.5 rounded-xl font-bold transition-colors mr-2"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                                <Link 
                                    href={`/event/create?preselect=${club.id}`}
                                    className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ml-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Post Event</span>
                                </Link>
                            </>
                            
                            )}

                            {club.socials?.instagram && <SocialButton icon={Instagram} href={club.socials.instagram} label="Instagram" />}
                            {/* Add other socials... */}
                            
                            
                            <a 
                                href={`mailto:${club.email}`} 
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ml-2"
                            >
                                <Mail className="w-4 h-4" />
                                <span className="hidden sm:inline">Contact</span>
                            </a>
                        </>
                    )}
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative transition-colors">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">About Us</h2>
                {isEditing ? (
                    <textarea 
                        value={formData.description || ""}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full h-48 p-4 rounded-xl border border-gray-200 dark:border-gray-700 
                                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                   text-lg leading-relaxed text-gray-700 dark:text-gray-200
                                   bg-white dark:bg-gray-800 transition-colors"
                        placeholder="Describe your club..."
                    />
                ) : (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg transition-colors">
                        {club.description}
                    </p>
                )}
            </div>

            {/* Events List (Read Only) */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                    Hosted Events
                </h3>
                
                {upcomingEvents.length > 0 ? (
                    <div className="space-y-4 mb-8">
                        {upcomingEvents.map(event => (
                            <EventCard key={event.id} event={event} isPast={false} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 mb-8 transition-colors">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No upcoming events scheduled.</p>
                    </div>
                )}

                {pastEvents.length > 0 && (
                    <div className="opacity-75 hover:opacity-100 transition-opacity">
                        <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 border-t border-gray-200 dark:border-gray-800 pt-8 transition-colors">
                            <Clock className="w-5 h-5" />
                            Past Events
                        </h3>
                        <div className="space-y-4">
                            {pastEvents.map(event => (
                                <EventCard key={event.id} event={event} isPast={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* RIGHT: Sidebar Info */}
          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-8 transition-colors">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6 transition-colors">Club Details</h3>
                <div className="space-y-5">
                    
                    {/* Email Input */}
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400 transition-colors">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5 transition-colors">Email</p>
                            {isEditing ? (
                                <input 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                                />
                            ) : (
                                <a href={`mailto:${club.email}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 break-all transition-colors">
                                    {club.email}
                                </a>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-purple-600 dark:text-purple-400 transition-colors">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5 transition-colors">Membership</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">Open to all students</p>
                        </div>
                    </div>
                </div>
             </div>

             {/* 2. OWNER ACTIONS (Moved here) */}
             {isOwner && (
                 <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mt-5 border border-gray-100 dark:border-gray-800 transition-colors">
                     <button 
                         onClick={logout}
                         className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-900/30 rounded-xl font-semibold transition-all group"
                         title="Sign Out"
                     >
                        <span>Sign Out</span>
                        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}