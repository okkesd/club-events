// app/event/[id]/ShareButton.tsx
"use client";

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function ShareButton() {
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
      className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Clipped!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 text-gray-500" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}