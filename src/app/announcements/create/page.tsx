"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Megaphone } from "lucide-react";
import Link from "next/link";
import { createAnnouncement } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import AnnouncementForm from "@/app/components/AnnouncementForm";

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createAnnouncement({ ...data, clubId: user.id });
      router.push("/announcements");
    } catch (err: any) {
      alert(err.message || "Failed to create announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent flex flex-col items-center justify-center gap-4 transition-colors">
        <Megaphone className="w-12 h-12 text-gray-300 dark:text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900">Login required</h2>
        <Link href="/login" className="text-blue-600 dark:text-blue-400 vibrant:text-purple-600 font-semibold hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent py-8 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/announcements"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Announcements
        </Link>

        <div className="bg-white dark:bg-gray-900 vibrant:bg-white/80 rounded-2xl border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 shadow-sm p-6 md:p-8 transition-colors">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 mb-6 transition-colors">
            Post Announcement
          </h1>
          <AnnouncementForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
