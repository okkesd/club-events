"use client";
import {useUI} from "@/i18n/useUI";


import { useState, useEffect } from 'react';
import Link from 'next/link';

const NOTICE_KEY = 'cookie_notice_dismissed_v1';

export default function CookieBanner() {
  const {t} = useUI();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(NOTICE_KEY) === 'true') return;
    } catch {
      // The notice remains usable when browser storage is unavailable.
    }
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    try {
      // This records dismissal of an informational notice, not consent.
      localStorage.setItem(NOTICE_KEY, 'true');
      localStorage.removeItem('cookie_consent');
    } catch {
      // Closing the notice should not depend on storage access.
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label={t("Cookies and browser storage")}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="pointer-events-auto max-w-2xl mx-auto bg-white dark:bg-gray-900 vibrant:bg-white border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 rounded-xl shadow-lg p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 vibrant:text-purple-900 leading-relaxed">
          {t("We use browser storage for sign-in and preferences, and a cookie to avoid counting repeat likes and views.")}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <Link href="/legal/cookies" className="inline-flex min-h-11 items-center text-sm font-medium text-blue-600 dark:text-blue-400 vibrant:text-purple-700 underline underline-offset-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
            {t("Cookie details")}</Link>
          <button
            onClick={handleDismiss}
            className="min-h-11 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 vibrant:text-purple-800 bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-100 hover:bg-gray-200 dark:hover:bg-gray-700 vibrant:hover:bg-purple-200 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            {t("Close")}</button>
        </div>
      </div>
    </aside>
  );
}
