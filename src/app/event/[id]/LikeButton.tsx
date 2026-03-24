"use client";
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleEventLike } from '@/app/lib/api';

interface LikeButtonProps {
  eventId: string;
  initialLikes: number;
  initialHasLiked: boolean;
}

export default function LikeButton({ eventId, initialLikes, initialHasLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);

    // Optimistic UI
    setHasLiked((prev) => !prev);
    setLikes((prev) => prev + (hasLiked ? -1 : 1));

    try {
      const data = await toggleEventLike(eventId);
      // Sync with server truth
      setLikes(data.likes);
      setHasLiked(data.hasLiked);
    } catch (error) {
      console.error("Failed to like event:", error);
      // Revert
      setHasLiked(initialHasLiked);
      setLikes(initialLikes);
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
      <span className="text-xs font-bold">{likes}</span>
    </button>
  );
}
