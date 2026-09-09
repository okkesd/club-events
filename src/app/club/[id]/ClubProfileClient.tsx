"use client";
import { isAnnouncementExpired as hasAnnouncementExpired } from "@/app/lib/announcementExpiry";
import {useUI} from "@/i18n/useUI";


import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail, Instagram, Globe, Linkedin, Calendar,
  MapPin, ExternalLink, ArrowLeft, Users, Clock,
  Camera, Save, X, Edit3,
  LogOut, Megaphone, ShieldAlert,
} from 'lucide-react';
import { IAnnouncement } from '@/app/lib/types';
import { updateClub, uploadImage, resolveImageUrl } from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/context/AuthContext";
import ClubSubscribeButton from './ClubSubscibeButton';

// --- Helper Components ---
function SocialButton({ icon: Icon, href, label }: { icon: any, href: string, label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-colors border border-gray-200
                 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400
                 vibrant:bg-purple-50 vibrant:border-purple-200 vibrant:text-purple-500 vibrant:hover:bg-purple-100 vibrant:hover:text-purple-700"
      title={label}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

function EventCard({ event, isPast = false }: { event: any, isPast?: boolean }) {
    const {locale} = useUI();
    const dateObj = new Date(event.date);
    const month = dateObj.toLocaleString(locale, { month: 'short' });
    const day = dateObj.getDate();

    return (
        <Link
            href={`/event/${event.id}`}
            className={`group block bg-white p-4 rounded-xl border transition-all duration-300
                dark:bg-gray-900 dark:border-gray-800
                vibrant:bg-white/70 vibrant:backdrop-blur-sm
                ${isPast
                ? 'border-gray-100 opacity-75 hover:opacity-100 hover:border-gray-300 dark:opacity-50 dark:hover:opacity-100 dark:hover:border-gray-600 vibrant:border-purple-100 vibrant:hover:border-purple-300'
                : 'border-gray-200 hover:border-blue-400 hover:shadow-md dark:hover:border-blue-500/50 dark:hover:shadow-blue-900/10 vibrant:border-purple-200 vibrant:hover:border-purple-400 vibrant:hover:shadow-purple-200/30'
            }`}
        >
            <div className="flex items-start gap-4">
                {/* Date Box */}
                <div className={`shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center border transition-colors
                    ${isPast
                    ? 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 vibrant:bg-purple-50 vibrant:text-purple-400 vibrant:border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40 dark:group-hover:bg-blue-600 dark:group-hover:text-white vibrant:bg-purple-50 vibrant:text-purple-700 vibrant:border-purple-200 vibrant:group-hover:bg-purple-600 vibrant:group-hover:text-white'
                }`}>
                    <span className="text-xs font-bold uppercase">{month}</span>
                    <span className="text-xl font-extrabold">{day}</span>
                </div>

                {/* Content */}
                <div>
                    <h4 className={`text-lg font-bold transition-colors ${
                        isPast
                        ? 'text-gray-600 dark:text-gray-500 vibrant:text-purple-400'
                        : 'text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-400 vibrant:text-purple-900 vibrant:group-hover:text-purple-600'
                    }`}>
                        {event.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 vibrant:text-purple-500 mt-2">
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
export default function ClubProfileClient({ initialClub, events, announcements = [] }: { initialClub: any, events: any[], announcements?: IAnnouncement[] }) {
  const {t, locale} = useUI();
  const router = useRouter();
  const { user, logout } = useAuth();

  // 1. STATE
  const [club, setClub] = useState(initialClub);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'announcements'>('events');

  // Form State
  const [formData, setFormData] = useState({
    clubName: initialClub.clubName,
    description: initialClub.description,
    email: initialClub.email,
    banner_url: initialClub.bannerUrl,
    logo_url: initialClub.logoUrl,
  });

  const isOwner = user && user.id === club.id;
  const isAdmin = user && user.role === 'admin';
  const isUnverified = !club.isVerified;

  // Announcements expire 14 days after creation (or at expiresAt if set)
  const isAnnouncementExpired = (a: IAnnouncement) => {
    const now = new Date();
    if (a.expiresAt) return hasAnnouncementExpired(a.expiresAt, now.getTime());
    const created = new Date(a.createdAt);
    created.setDate(created.getDate() + 14);
    return created < now;
  };

  const activeAnnouncements = announcements.filter(a => !isAnnouncementExpired(a));
  const visibleAnnouncements = isOwner ? announcements : activeAnnouncements;

  // Access restriction: unverified clubs are only visible to the owner and admins
  if (isUnverified && !isOwner && !isAdmin) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent min-h-screen flex items-center justify-center px-4 transition-colors">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 vibrant:bg-yellow-100/80 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 mb-2">{t("Club Not Available")}</h2>
          <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-600 mb-6">{t("This club profile is not publicly available yet. It may be pending verification.")}</p>
          <Link href="/clubs" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("Browse Clubs")}</Link>
        </div>
      </div>
    );
  }

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
        alert(t("Failed to save changes."));
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

  // An event is past only after its end time (date + endTime), not just the date
  const isEventPast = (e: any) => {
    const end = new Date(`${e.date}T${e.endTime || "23:59"}`);
    return end < now;
  };

  const upcomingEvents = sortedEvents.filter(e => !isEventPast(e))
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = sortedEvents.filter(e => isEventPast(e));

  return (
    <div className="bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent min-h-screen pb-20 transition-colors duration-300">

      {/* --- HERO HEADER --- */}
      <div className="bg-white dark:bg-gray-900 vibrant:bg-white/60 vibrant:backdrop-blur-sm shadow-sm mb-6 transition-colors">

        {/* BANNER AREA */}
        <div className="relative h-48 md:h-64 w-full bg-gray-900 dark:bg-black overflow-hidden group">
          {formData.banner_url ? (
            <img
              src={resolveImageUrl(formData.banner_url)}
              alt={t("Club Banner")}
              className={`w-full h-full object-cover transition-opacity ${isEditing ? 'opacity-60' : 'opacity-90'}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-indigo-950 vibrant:from-purple-600 vibrant:to-pink-500" />
          )}

          {/* Back Button */}
          <Link
            href="/main"
            className="absolute top-4 left-4 bg-white/90 dark:bg-black/50 backdrop-blur hover:bg-white dark:hover:bg-black/70
                       text-gray-800 dark:text-white px-3 py-1.5 rounded-lg text-sm font-semibold
                       flex items-center gap-2 transition-all shadow-sm z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Back")}</Link>

          {/* EDIT: Banner Upload Button */}
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 hover:bg-black/50 transition-colors z-20">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-900 dark:text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors">
                    <Camera className="w-5 h-5" />
                    {t("Change Banner")}</div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner_url')} />
            </label>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 mb-6 gap-6 relative z-10">

            {/* LOGO AREA */}
            <div className="bg-white dark:bg-gray-900 vibrant:bg-white/90 p-1.5 rounded-2xl shadow-lg shrink-0 relative group transition-colors">
              <img
                src={resolveImageUrl(formData.logo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(club.clubName)}&background=random&size=160`}
                alt={t("Club Logo")}
                className="w-28 h-28 md:w-40 md:h-40 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-50 border border-gray-100 dark:border-gray-800 vibrant:border-purple-200 transition-colors"
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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 vibrant:bg-purple-100 vibrant:text-purple-700 uppercase tracking-wide transition-colors">
                            {club.category || t("Club")}
                        </span>
                        {isUnverified && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 vibrant:bg-yellow-100/80 vibrant:text-yellow-700 uppercase tracking-wide">
                            <ShieldAlert className="w-3 h-3" />
                            {t("Unverified")}</span>
                        )}
                    </div>

                    {/* EDIT: Title Input vs Text */}
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.clubName}
                            onChange={(e) => setFormData({...formData, clubName: e.target.value})}
                            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 border-b-2 border-blue-500 vibrant:border-purple-500 focus:outline-none bg-transparent w-full transition-colors"
                        />
                    ) : (
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 leading-tight transition-colors">
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
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 vibrant:bg-white/80 border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 text-gray-700 dark:text-gray-200 vibrant:text-purple-700 px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700 vibrant:hover:bg-white"
                            >
                                <X className="w-4 h-4" />
                                {t("Cancel")}</button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? t("Saving...") : t("Save Changes")}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* OWNER ONLY: Edit Button */}
                            {isOwner && (
                                <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 vibrant:bg-purple-100 vibrant:text-purple-700 vibrant:hover:bg-purple-200 px-4 py-2.5 rounded-xl font-bold transition-colors mr-2"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    {t("Edit Profile")}</button>
                            </>

                            )}

                            {club.socials?.instagram && <SocialButton icon={Instagram} href={club.socials.instagram} label="Instagram" />}
                            {/* Add other socials... */}

                            <ClubSubscribeButton clubId={club.id} clubName={club.name} />

                            <a
                                href={`mailto:${club.email}`}
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 vibrant:bg-white/80 border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 text-gray-700 dark:text-gray-200 vibrant:text-purple-700 px-4 py-2.5 rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700 vibrant:hover:bg-white ml-2"
                            >
                                <Mail className="w-4 h-4" />
                                <span className="hidden sm:inline">{t("Contact")}</span>
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

          {/* LEFT: About, Events & Announcements */}
<div className="lg:col-span-2 space-y-8">

  {/* About Section */}
  <div className="bg-white dark:bg-gray-900 vibrant:bg-white/70 vibrant:backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 vibrant:border-purple-200 relative transition-colors">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 mb-4 transition-colors">{t("About Us")}</h2>
      {isEditing ? (
          <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full h-48 p-4 rounded-xl border border-gray-200 dark:border-gray-700 vibrant:border-purple-200
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 vibrant:focus:ring-purple-500 vibrant:focus:border-purple-400
                         text-lg leading-relaxed text-gray-700 dark:text-gray-200 vibrant:text-purple-900
                         bg-white dark:bg-gray-800 vibrant:bg-white/80 transition-colors"
              placeholder={t("Describe your club...")}
          />
      ) : (
          <p className="text-gray-600 dark:text-gray-300 vibrant:text-purple-700 leading-relaxed whitespace-pre-line text-lg transition-colors">
              {club.description}
          </p>
      )}
  </div>

  {/* Content Tabs Navigation */}
  <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 vibrant:border-purple-200 mb-6 transition-colors">
      <button
          onClick={() => setActiveTab('events')}
          className={`pb-4 text-lg font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'events'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 vibrant:border-purple-600 vibrant:text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 vibrant:text-purple-400 vibrant:hover:text-purple-600'
          }`}
      >
          <Calendar className="w-5 h-5" />
          {t("Events")}{upcomingEvents.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ml-1 transition-colors ${
                  activeTab === 'events' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 vibrant:bg-purple-200 vibrant:text-purple-800'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-100/50 vibrant:text-purple-500'
              }`}>
                  {upcomingEvents.length}
              </span>
          )}
      </button>
      <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-4 text-lg font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'announcements'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 vibrant:border-purple-600 vibrant:text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 vibrant:text-purple-400 vibrant:hover:text-purple-600'
          }`}
      >
          <Megaphone className="w-5 h-5" />
          {t("Announcements")}{/* Optional Badge for count */}
          {visibleAnnouncements.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ml-1 transition-colors ${
                  activeTab === 'announcements'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 vibrant:bg-purple-200 vibrant:text-purple-800'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-100/50 vibrant:text-purple-500'
              }`}>
                  {visibleAnnouncements.length}
              </span>
          )}
      </button>
  </div>

  {/* Tab Content Area */}
  <div className="min-h-[300px]">
      
      {/* EVENTS TAB */}
      {activeTab === 'events' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {upcomingEvents.length > 0 ? (
                  <div className="space-y-4 mb-8">
                      {upcomingEvents.map(event => (
                          <EventCard key={event.id} event={event} isPast={false} />
                      ))}
                  </div>
              ) : (
                  <div className="bg-white dark:bg-gray-900 vibrant:bg-white/60 vibrant:backdrop-blur-sm rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 vibrant:border-purple-300 mb-8 transition-colors">
                      <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 font-medium">{t("No upcoming events scheduled.")}</p>
                  </div>
              )}

              {pastEvents.length > 0 && (
                  <div className="opacity-75 hover:opacity-100 transition-opacity">
                      <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 vibrant:text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-t border-gray-200 dark:border-gray-800 vibrant:border-purple-200 pt-8 transition-colors">
                          <Clock className="w-5 h-5" />
                          {t("Past Events")}</h3>
                      <div className="space-y-4">
                          {pastEvents.map(event => (
                              <EventCard key={event.id} event={event} isPast={true} />
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {visibleAnnouncements.length > 0 ? (
                  <div className="space-y-3">
                      {visibleAnnouncements.map((a) => {
                          const expired = isAnnouncementExpired(a);
                          return (
                          <Link
                              key={a.id}
                              href={`/announcements/${a.id}`}
                              className={`group block bg-white dark:bg-gray-900 vibrant:bg-white/70 vibrant:backdrop-blur-sm p-4 rounded-xl border hover:shadow-md transition-all ${
                                  expired
                                    ? 'opacity-60 border-gray-100 dark:border-gray-800 vibrant:border-purple-100 hover:opacity-100'
                                    : 'border-gray-200 dark:border-gray-800 vibrant:border-purple-200 hover:border-blue-400 dark:hover:border-blue-500 vibrant:hover:border-purple-400 vibrant:hover:shadow-purple-200/30'
                              }`}
                          >
                              <div className="flex items-start gap-3">
                                  <div className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                      expired
                                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 vibrant:bg-purple-50 vibrant:text-purple-300'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 vibrant:bg-purple-100 vibrant:text-purple-700'
                                  }`}>
                                      {t(a.category)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-gray-900 dark:text-gray-100 vibrant:text-purple-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 vibrant:group-hover:text-purple-600 truncate transition-colors">
                                          {a.title}
                                      </h4>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-500 mt-1 line-clamp-1">
                                          {a.body}
                                      </p>
                                  </div>
                                  {expired ? (
                                      <span className="shrink-0 flex items-center gap-1 text-[10px] text-red-400 dark:text-red-500 vibrant:text-red-400 font-medium">
                                          <Clock className="w-3 h-3" />
                                          {t("Expired")}</span>
                                  ) : a.expiresAt ? (
                                      <span className="shrink-0 flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 vibrant:text-purple-400">
                                          <Clock className="w-3 h-3" />
                                          {new Date(a.expiresAt).toLocaleDateString(locale, { month: "short", day: "numeric" })}
                                      </span>
                                  ) : null}
                              </div>
                          </Link>
                          );
                      })}
                      <Link
                          href={`/announcements`}
                          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 vibrant:text-purple-600 vibrant:hover:text-pink-600 hover:underline"
                      >
                          {t("View all announcements")}</Link>
                  </div>
              ) : (
                  <div className="bg-white dark:bg-gray-900 vibrant:bg-white/60 vibrant:backdrop-blur-sm rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 vibrant:border-purple-300 transition-colors">
                      <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 font-medium">{t("No announcements posted yet.")}</p>
                  </div>
              )}
          </div>
      )}

  </div>
</div>

          {/* RIGHT: Sidebar Info */}
          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-900 vibrant:bg-white/70 vibrant:backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 vibrant:border-purple-200 sticky top-8 transition-colors">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 vibrant:text-purple-400 uppercase tracking-wider mb-6 transition-colors">{t("Club Details")}</h3>
                <div className="space-y-5">

                    {/* Email Input */}
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 vibrant:bg-purple-100 p-2 rounded-lg text-blue-600 dark:text-blue-400 vibrant:text-purple-600 transition-colors">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                            <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-500 font-medium mb-0.5 transition-colors">{t("Email")}</p>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full p-2 border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 rounded-lg text-sm font-semibold bg-white dark:bg-gray-800 vibrant:bg-white/80 text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors"
                                />
                            ) : (
                                <a href={`mailto:${club.email}`} className="text-sm font-semibold text-gray-900 dark:text-white vibrant:text-purple-900 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-purple-600 break-all transition-colors">
                                    {club.email}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="bg-purple-50 dark:bg-purple-900/20 vibrant:bg-pink-100 p-2 rounded-lg text-purple-600 dark:text-purple-400 vibrant:text-pink-600 transition-colors">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-500 font-medium mb-0.5 transition-colors">{t("Membership")}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">{t("Open to all students")}</p>
                        </div>
                    </div>
                </div>
             </div>

             {/* 2. OWNER ACTIONS (Moved here) */}
             {isOwner && (
                 <div className="bg-gray-50 dark:bg-gray-800/50 vibrant:bg-white/50 vibrant:backdrop-blur-sm rounded-2xl p-6 mt-5 border border-gray-100 dark:border-gray-800 vibrant:border-purple-200 transition-colors">
                     <button
                         onClick={logout}
                         className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 vibrant:bg-white/80 hover:bg-red-50 dark:hover:bg-red-900/10 vibrant:hover:bg-red-50/80 text-gray-700 dark:text-gray-300 vibrant:text-purple-700 hover:text-red-600 dark:hover:text-red-400 vibrant:hover:text-red-600 border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 hover:border-red-100 dark:hover:border-red-900/30 vibrant:hover:border-red-200 rounded-xl font-semibold transition-all group"
                         title={t("Sign Out")}
                     >
                        <span>{t("Sign Out")}</span>
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
