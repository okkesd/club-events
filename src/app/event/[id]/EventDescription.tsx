"use client";

import { useEffect, useRef, useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { useUI } from '@/i18n/useUI';
import { translateEventDescription } from '@/app/lib/api';

export default function EventDescription({ eventId, description }: { eventId: string; description: string }) {
  const { language } = useUI();
  // Drop translations and cancel pending requests when language or source changes.
  return <DescriptionContent key={JSON.stringify([eventId, description, language])} eventId={eventId} description={description} />;
}

function DescriptionContent({ eventId, description }: { eventId: string; description: string }) {
  const { t, language } = useUI();
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  const toggleTranslation = async () => {
    if (language === 'tr' || request.current) return;
    if (translation !== null) {
      setShowTranslation(value => !value);
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(false);
    try {
      const translated = await translateEventDescription(eventId, language, controller.signal);
      if (controller.signal.aborted) return;
      setTranslation(translated);
      setShowTranslation(true);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setLoading(false);
      }
    }
  };

  return <>
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">{t("About Event")}</h3>
      {language !== 'tr' && description.trim() && (
        <button type="button" onClick={toggleTranslation} disabled={loading} aria-controls="event-description" aria-pressed={showTranslation}
          className="ml-auto inline-flex items-center gap-1.5 rounded text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 vibrant:text-purple-600 vibrant:hover:text-purple-800 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60 disabled:cursor-wait">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Languages className="h-4 w-4" aria-hidden="true" />}
          {loading ? t("Translating...") : showTranslation ? t("Show original") : t("Translate description")}
        </button>
      )}
    </div>
    {error && <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">{t("Translation failed. Please try again.")}</p>}
    <div id="event-description" aria-live="polite" aria-busy={loading} lang={showTranslation ? language : undefined}
      className="prose prose-blue prose-sm md:prose-base dark:prose-invert text-gray-600 dark:text-gray-300 vibrant:text-purple-700 whitespace-pre-line [overflow-wrap:anywhere] leading-relaxed max-w-none transition-colors">
      {showTranslation ? translation : description}
    </div>
  </>;
}
