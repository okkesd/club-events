"use client";

import SourcePostButton from "@/app/components/SourcePostButton";
import { EventBrochure } from "@/app/event/[id]/EventBrochure";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Megaphone, ExternalLink, Pin, Clock,
  Edit3, Trash2, Tag as TagIcon, CalendarDays, User,
} from "lucide-react";
import { fetchAnnouncementById, deleteAnnouncement, resolveImageUrl } from "@/app/lib/api";
import { IAnnouncement, AnnouncementCategory } from "@/app/lib/types";
import { useAuth } from "@/app/context/AuthContext";

const CATEGORY_COLORS: Record<AnnouncementCategory, string> = {
  internship: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  job: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  scholarship: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  competition: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  recruitment: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  academic: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  workshop: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [announcement, setAnnouncement] = useState<IAnnouncement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchAnnouncementById(id)
      .then((data) => setAnnouncement(data))
      .finally(() => setIsLoading(false));
  }, [id]);

  const isOwner = user && announcement && (user.id === announcement.clubId || user.role === "admin");

  const handleDelete = async () => {
    if (!announcement) return;
    setIsDeleting(true);
    try {
      await deleteAnnouncement(announcement.id);
      router.push("/announcements");
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const expiring = announcement?.expiresAt && (() => {
    const diff = new Date(announcement.expiresAt!).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  })();

  const expired = announcement?.expiresAt && new Date(announcement.expiresAt).getTime() < Date.now();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent flex items-center justify-center transition-colors">
        <div className="w-8 h-8 border-4 border-blue-600 vibrant:border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent flex flex-col items-center justify-center gap-4 transition-colors">
        <Megaphone className="w-12 h-12 text-gray-300 dark:text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Announcement not found</h2>
        <Link href="/announcements" className="text-blue-600 dark:text-blue-400 vibrant:text-purple-600 font-semibold hover:underline">
          Back to Announcements
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent py-8 px-4 transition-colors">
      <div className={`${announcement.coverImage ? "max-w-6xl" : "max-w-3xl"} mx-auto`}>
        {/* Top nav */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Announcements
          </Link>

          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/announcements/${announcement.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all
                  bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600
                  dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-blue-400"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all
                  bg-white text-red-600 border border-gray-200 hover:border-red-400 hover:bg-red-50
                  dark:bg-gray-800 dark:text-red-400 dark:border-gray-700 dark:hover:bg-gray-700
                  disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> {isDeleting ? "..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-8 items-start ${announcement.coverImage ? "lg:grid-cols-3" : ""}`}>
          {/* Cover image */}
          {announcement.coverImage && (
            <div className="lg:sticky lg:top-8 rounded-2xl border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 bg-white dark:bg-gray-900 vibrant:bg-white/80 shadow-sm overflow-hidden transition-colors">
              <EventBrochure
                src={resolveImageUrl(announcement.coverImage)}
                alt={announcement.title}
              />
            </div>
          )}

        {/* Announcement content */}
        <article className={`${announcement.coverImage ? "lg:col-span-2" : ""} min-w-0 break-words bg-white dark:bg-gray-900 vibrant:bg-white/80 rounded-2xl border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 shadow-sm overflow-hidden transition-colors`}>
          <div className="p-6 md:p-8">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {announcement.isPinned && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${CATEGORY_COLORS[announcement.category]}`}>
                {announcement.category}
              </span>
              {expiring && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  <Clock className="w-3 h-3" /> Expiring Soon
                </span>
              )}
              {expired && (
                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  Expired
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 leading-tight mb-4 transition-colors">
              {announcement.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 vibrant:text-purple-500 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800 vibrant:border-purple-100 transition-colors">
              <Link
                href={`/club/${announcement.clubId}`}
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="font-semibold">{announcement.clubName}</span>
              </Link>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {new Date(announcement.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              {announcement.expiresAt && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Deadline: {new Date(announcement.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 vibrant:text-purple-800 whitespace-pre-line leading-relaxed mb-6 transition-colors">
              {announcement.body}
            </div>
                <SourcePostButton url={announcement.sourcePostUrl} />

            {/* Tags */}
            {announcement.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {announcement.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-50 vibrant:text-purple-600 transition-colors"
                  >
                    <TagIcon className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* External link */}
            {announcement.link && (
              <a
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all
                  bg-blue-600 hover:bg-blue-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 text-white"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Link
              </a>
            )}
          </div>
        </article>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Announcement</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50
                  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
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
