// app/event/[id]/EventBrochure.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Import this
import { X, ZoomIn } from 'lucide-react';

export function EventBrochure({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Handle Hydration (Next.js specific)
  // We need to wait until the component is mounted on the client 
  // before we can access 'document.body' for the portal.
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Handle Escape Key & Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // The Thumbnail stays in the normal flow
  const thumbnail = (
    <div 
      onClick={() => setIsOpen(true)}
      className="group relative cursor-zoom-in w-full h-auto bg-gray-100 border border-gray-100 overflow-hidden"
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
           <ZoomIn className="w-5 h-5 text-gray-700" />
        </div>
      </div>
    </div>
  );

  // The Modal uses a Portal to jump to the <body>
  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      onClick={() => setIsOpen(false)}
    >
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-[10000]"
      >
        <X className="w-8 h-8" />
      </button>

      <img 
        src={src} 
        alt={alt}
        className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-300 select-none"
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  ) : null;

  // Render logic
  return (
    <>
      {thumbnail}
      {/* Teleport the modal to document.body if mounted */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}