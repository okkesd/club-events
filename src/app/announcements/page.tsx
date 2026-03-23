"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Megaphone, Pin, Clock, ExternalLink, Plus,
  ChevronRight, Filter, X, Tag as TagIcon,
} from "lucide-react";
import { fetchAnnouncements, resolveImageUrl } from "@/app/lib/api";
import { IAnnouncement, AnnouncementCategory } from "@/app/lib/types";
import { useAuth } from "@/app/context/AuthContext";

const CATEGORIES: { value: AnnouncementCategory; label: string; color: string }[] = [
  { value: "internship", label: "Internship", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 vibrant:bg-blue-100 vibrant:text-blue-700" },
  { value: "job", label: "Job", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 vibrant:bg-green-100 vibrant:text-green-700" },
  { value: "scholarship", label: "Scholarship", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 vibrant:bg-amber-100 vibrant:text-amber-700" },
  { value: "competition", label: "Competition", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 vibrant:bg-red-100 vibrant:text-red-700" },
  { value: "recruitment", label: "Recruitment", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 vibrant:bg-purple-100 vibrant:text-purple-700" },
  { value: "academic", label: "Academic", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 vibrant:bg-indigo-100 vibrant:text-indigo-700" },
  { value: "workshop", label: "Workshop", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 vibrant:bg-teal-100 vibrant:text-teal-700" },
  { value: "general", label: "General", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 vibrant:bg-gray-100 vibrant:text-gray-700" },
];

function getCategoryStyle(category: AnnouncementCategory) {
  return CATEGORIES.find((c) => c.value === category)?.color ?? CATEGORIES[7].color;
}

function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | "">("");
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, showExpired]);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAnnouncements({
        search: search || undefined,
        category: selectedCategory || undefined,
        include_expired: showExpired,
      });
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setShowExpired(false);
  };

  const hasFilters = search || selectedCategory || showExpired;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 vibrant:border-purple-200 py-12 px-4 mb-8 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 vibrant:bg-purple-100 rounded-xl">
                <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400 vibrant:text-purple-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white vibrant:text-purple-900 tracking-tight transition-colors">
                Announcements
              </h1>
            </div>
            {user && (
              <Link
                href="/announcements/create"
                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Post Announcement
              </Link>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 max-w-2xl transition-colors">
            Internships, scholarships, jobs, competitions and more from campus clubs.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl transition-colors outline-none
                bg-white border border-gray-200 text-gray-900 placeholder-gray-500
                focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:placeholder-gray-400
                dark:focus:ring-blue-900/50 dark:focus:border-blue-500
                vibrant:bg-white/80 vibrant:border-purple-200 vibrant:focus:ring-purple-200 vibrant:focus:border-purple-500"
            />
          </div>

          {/* Category chips + controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 vibrant:text-purple-400 shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(selectedCategory === cat.value ? "" : cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat.value
                    ? cat.color + " ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-500 vibrant:ring-purple-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-50 vibrant:text-purple-400 hover:bg-gray-200 dark:hover:bg-gray-700 vibrant:hover:bg-purple-100"
                }`}
              >
                {cat.label}
              </button>
            ))}

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 vibrant:bg-purple-200 mx-1" />

            <button
              onClick={() => setShowExpired(!showExpired)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                showExpired
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 ring-2 ring-offset-1 ring-orange-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-50 vibrant:text-purple-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Show Expired
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile create button */}
        {user && (
          <Link
            href="/announcements/create"
            className="md:hidden flex items-center justify-center gap-2 mb-6 bg-blue-600 hover:bg-blue-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm w-full"
          >
            <Plus className="w-4 h-4" />
            Post Announcement
          </Link>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 h-48 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse transition-colors" />
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <Megaphone className="w-8 h-8 text-gray-400 dark:text-gray-500 vibrant:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">No announcements found</h3>
            <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-400 mt-2 transition-colors">
              {hasFilters ? "Try adjusting your filters." : "Check back soon for new posts."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementCard({ announcement: a }: { announcement: IAnnouncement }) {
  const expiring = isExpiringSoon(a.expiresAt);
  const expired = isExpired(a.expiresAt);

  return (
    <Link
      href={`/announcements/${a.id}`}
      className={`group block bg-white dark:bg-gray-900 vibrant:bg-white/80 rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
        ${a.isPinned
          ? "border-amber-300 dark:border-amber-700 vibrant:border-amber-300 shadow-sm"
          : "border-gray-200 dark:border-gray-800 vibrant:border-purple-200"
        }
        ${expired ? "opacity-60" : ""}
      `}
    >
      {/* Top row: pinned + category + expiry */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {a.isPinned && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Pin className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase">Pinned</span>
          </span>
        )}
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getCategoryStyle(a.category)}`}>
          {a.category}
        </span>
        {expiring && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <Clock className="w-3 h-3" /> Expiring Soon
          </span>
        )}
        {expired && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            Expired
          </span>
        )}
      </div>

      {/* Cover image */}
      {a.coverImage && (
        <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
          <img src={resolveImageUrl(a.coverImage)} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white vibrant:text-purple-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 vibrant:group-hover:text-pink-600 leading-snug mb-1.5 transition-colors">
        {a.title}
      </h3>

      {/* Club + date */}
      <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-400 mb-2 transition-colors">
        {a.clubName} · {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>

      {/* Body preview */}
      <p className="text-sm text-gray-600 dark:text-gray-300 vibrant:text-purple-700 line-clamp-2 leading-relaxed mb-3">
        {a.body}
      </p>

      {/* Tags + link */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {a.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-50 vibrant:text-purple-500">
              <TagIcon className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
          {a.tags.length > 3 && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">+{a.tags.length - 3}</span>
          )}
        </div>
        {a.link && <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 vibrant:text-purple-400 shrink-0" />}
      </div>
    </Link>
  );
}
