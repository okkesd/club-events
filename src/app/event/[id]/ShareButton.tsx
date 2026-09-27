"use client";
import {useUI} from "@/i18n/useUI";
// app/event/[id]/ShareButton.tsx
import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function ShareButton({ title }: { title: string }) {
  const {t} = useUI();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    setError(false);
    const data = { title, url: window.location.href };

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        try {
          await navigator.share(data);
          return;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
        }
      }

      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-col [&>button]:flex-1">
    <button
      type="button"
      disabled={sharing}
      onClick={handleShare}
      className="flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-sm font-semibold transition-all active:scale-95 cursor-pointer border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400">{t("Clipped!")}</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>{t("Share")}</span>
        </>
      )}
    </button>
    {error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{t("Something went wrong. Please try again.")}</p>}
    </div>
  );
}
