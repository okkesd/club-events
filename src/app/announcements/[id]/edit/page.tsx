"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Megaphone } from "lucide-react";
import { fetchAnnouncementById, updateAnnouncement } from "@/app/lib/api";
import { IAnnouncement } from "@/app/lib/types";
import { useAuth } from "@/app/context/AuthContext";
import AnnouncementForm from "@/app/components/AnnouncementForm";

export default function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [announcement, setAnnouncement] = useState<IAnnouncement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchAnnouncementById(id)
      .then((data) => setAnnouncement(data))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (data: any) => {
    if (!announcement) return;
    setIsSubmitting(true);
    try {
      await updateAnnouncement(announcement.id, data);
      router.push(`/announcements/${announcement.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 vibrant:text-purple-500" />
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

  const isOwner = user && (user.id === announcement.clubId || user.role === "admin");
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent flex flex-col items-center justify-center gap-4 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Not authorized</h2>
        <Link href="/announcements" className="text-blue-600 dark:text-blue-400 vibrant:text-purple-600 font-semibold hover:underline">
          Back to Announcements
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent py-8 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/announcements/${announcement.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Announcement
        </Link>

        <div className="bg-white dark:bg-gray-900 vibrant:bg-white/80 rounded-2xl border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 shadow-sm p-6 md:p-8 transition-colors">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 mb-6 transition-colors">
            Edit Announcement
          </h1>
          <AnnouncementForm
            initialData={{
              title: announcement.title,
              body: announcement.body,
              coverImage: announcement.coverImage,
              link: announcement.link,
              tags: announcement.tags,
              category: announcement.category,
              expiresAt: announcement.expiresAt,
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
