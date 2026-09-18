"use client";

import { useUI } from '@/i18n/useUI';
import type { AnnouncementCategory } from '@/app/lib/types';
import SubscribeForm from './SubscribeForm';

export default function StayUpdated({ selectedCategories }: { selectedCategories?: AnnouncementCategory[] }) {
  const { t } = useUI();
  return (
        <div className="mt-12 bg-white dark:bg-gray-900 vibrant:bg-white/80 rounded-2xl border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 p-6 transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white vibrant:text-purple-900 mb-2 transition-colors">
            {t("Stay updated")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 vibrant:text-purple-500 mb-4 transition-colors">
            {t("Get a weekly email with last week's announcements and upcoming events for the next week.")}</p>
          <SubscribeForm selectedCategories={selectedCategories} />
        </div>
  );
}
