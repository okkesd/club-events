"use client";
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleEventLike } from '@/app/lib/api';

interface LikeButtonProps {
  eventId: string;
  initialLikes: number;
  initialHasLiked: boolean;
  reFreshData: () => Promise<void>
}

export default function LikeButton({ eventId, initialLikes, initialHasLiked, reFreshData }: LikeButtonProps) {
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newHasLiked = !hasLiked;

    // Optimistic UI update
    setHasLiked(newHasLiked);

    try {
      await toggleEventLike(eventId, newHasLiked);
      await reFreshData();
    } catch (error) {
      console.error("Failed to like event:", error);
      // Revert on error
      setHasLiked(!newHasLiked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`flex flex-col items-center justify-center gap-1 py-2 px-3 border rounded-lg transition-all active:scale-95
        ${hasLiked
          ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400'
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
    >
      <Heart className={`w-5 h-5 transition-transform ${hasLiked ? 'fill-current scale-110' : ''}`} />
      <span className="text-xs font-bold">{initialLikes}</span>
    </button>
  );
}
