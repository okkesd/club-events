"use client";
import {useUI} from "@/i18n/useUI";
// app/event/[id]/ShareButton.tsx
import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function ShareButton() {
  const {t} = useUI();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    // Copy current URL to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      // Reset after 1 second
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <button 
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
  );
}
