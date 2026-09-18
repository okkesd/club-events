// app/event/[id]/EventBrochure.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ZoomIn, Loader2, RefreshCw } from 'lucide-react';
import { useUI } from '@/i18n/useUI';

function PosterImage({ src, alt, expanded = false }: { src: string; alt: string; expanded?: boolean }) {
  const { t } = useUI();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (status !== 'loading') return;
    const timeout = window.setTimeout(() => setStatus('failed'), 20000);
    return () => window.clearTimeout(timeout);
  }, [status, attempt]);

  return <div className={`relative ${expanded ? 'max-w-full' : 'w-full'} ${status !== 'loaded' ? 'min-h-64 min-w-64' : ''}`}>
    <Image
      key={attempt}
      src={src}
      alt={alt}
      width={expanded ? 1200 : 800}
      height={expanded ? 900 : 600}
      unoptimized
      loading="eager"
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('failed')}
      className={`${expanded ? 'w-auto h-auto max-w-full max-h-[85dvh] object-contain rounded-lg' : 'w-full h-auto object-contain'} ${status !== 'loaded' ? 'absolute inset-0 opacity-0 pointer-events-none' : ''}`}
    />
    {status !== 'loaded' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-100 p-6 text-center text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300" onClick={event => event.stopPropagation()}>
      {status === 'loading' ? <><Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none" aria-hidden="true" /><p role="status">{t('Loading poster...')}</p></> : <>
        <p role="status">{t('The poster could not load. Your connection may be slow.')}</p>
        <button type="button" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} aria-hidden="true" />{t('Retry poster')}</button>
      </>}
    </div>}
  </div>;
}

export function EventBrochure({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);
  // 2. Handle Escape Key & Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // The Thumbnail stays in the normal flow
  const thumbnail = (
    <div 
      onClick={() => setIsOpen(true)}
      className="group relative cursor-zoom-in w-full h-auto bg-gray-100 border border-gray-100 overflow-hidden"
    >
      <PosterImage key={src} src={src} alt={alt} />
      <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
           <ZoomIn className="w-5 h-5 text-gray-700" />
        </div>
      </div>
    </div>
  );

  // The Modal uses a Portal to jump to the <body>
  const modalContent = isOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 p-4 cursor-zoom-out"
      onClick={() => setIsOpen(false)}
    >
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-[10000]"
      >
        <X className="w-8 h-8" />
      </button>

      <PosterImage key={src} src={src} alt={alt} expanded />
    </div>
  ) : null;

  // Render logic
  return (
    <>
      {thumbnail}
      {/* Teleport the modal to document.body if mounted */}
      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
