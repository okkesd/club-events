"use client";

import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('cookie_consent', 'dismissed');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 ring-1 ring-black/5">

        {/* Icon & Text */}
        <div className="flex-1 flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl shrink-0">
            <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white">We value your privacy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              UniEvents uses your browser&apos;s local storage to keep you logged in and remember your theme preference, plus one essential cookie to prevent duplicate likes and views. We do not use tracking cookies or analytics.
              Learn more in our <Link href="/legal/cookies" className="text-blue-600 hover:underline dark:text-blue-400">Cookie &amp; Local Storage Policy</Link>.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDismiss}
            className="flex-1 md:flex-none py-2.5 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none py-2.5 px-6 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl shadow-md transition-all active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}