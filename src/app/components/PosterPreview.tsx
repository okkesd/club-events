"use client";

import { useRef } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { useUI } from '@/i18n/useUI';

export default function PosterPreview({ src }: { src: string }) {
  const { t } = useUI();
  const dialog = useRef<HTMLDialogElement>(null);

  return <>
    <button type="button" onClick={() => dialog.current?.showModal()} aria-label={t('Enlarge poster')}
      className="group relative block w-full cursor-zoom-in rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={t('Poster preview')} className="mx-auto max-h-80 rounded-lg object-contain" />
      <span className="absolute bottom-3 right-3 rounded-full bg-gray-950/75 p-2 text-white shadow-sm group-hover:bg-blue-600"><ZoomIn size={20} aria-hidden="true" /></span>
    </button>
    <dialog ref={dialog} aria-label={t('Poster preview')}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      className="fixed inset-0 m-auto h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-4 backdrop:bg-black/90 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center sm:p-8">
      <button type="button" autoFocus aria-label={t('Close')} onClick={() => dialog.current?.close()}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-white">
        <X size={24} aria-hidden="true" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={t('Poster preview')} className="max-h-full max-w-full rounded-lg object-contain" />
    </dialog>
  </>;
}
