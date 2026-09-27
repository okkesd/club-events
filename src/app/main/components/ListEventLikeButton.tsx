"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleEventLike } from '@/app/lib/api';
import { useUI } from '@/i18n/useUI';

export default function ListEventLikeButton({ eventId, initialHasLiked }: { eventId: string; initialHasLiked: boolean }) {
  const { t } = useUI();
  const [liked, setLiked] = useState(initialHasLiked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const toggle = async () => {
    if (pending) return;
    const previous = liked;
    setPending(true);
    setError(false);
    setLiked(!previous);
    try {
      const result = await toggleEventLike(eventId);
      setLiked(result.hasLiked);
    } catch {
      setLiked(previous);
      setError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={t('Like event')}
        aria-pressed={liked}
        className={`absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 vibrant:focus-visible:outline-campus-accent disabled:cursor-wait ${liked
          ? 'text-rose-600 dark:text-rose-300 vibrant:text-campus-accent'
          : 'text-gray-500 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-300 vibrant:text-campus-muted vibrant:hover:text-campus-accent lg:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
        }`}
      >
        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>
      {error && <span role="alert" className="sr-only">{t('Failed to like')}</span>}
    </>
  );
}
