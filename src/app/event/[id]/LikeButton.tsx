"use client";
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleEventLike } from '@/app/lib/api';

interface LikeButtonProps {
  eventId: string;
  initialLikes: number;
  reFreshData: () => Promise<void>
}

export default function LikeButton({ eventId, initialLikes, reFreshData }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Check Local Storage on Mount
  useEffect(() => {
    setMounted(true);
    
    // Only check if user has liked (boolean)
    const storedLiked = localStorage.getItem(`liked_event_${eventId}`) === 'true';
    setHasLiked(storedLiked);
    
    // ALWAYS use server count
    setLikes(initialLikes);
  }, [eventId, initialLikes]);

  const handleToggleLike = async () => {
  if (isLoading) return;

  setIsLoading(true);
  const newHasLiked = !hasLiked;

  // Update Local Storage (only liked status)
  if (newHasLiked) {
    localStorage.setItem(`liked_event_${eventId}`, 'true');
  } else {
    localStorage.removeItem(`liked_event_${eventId}`);
  }

  // Optimistically update UI
  setHasLiked(newHasLiked);

  try {
    // Call API
    await toggleEventLike(eventId, newHasLiked);
    
    // Refresh data from server to get updated count - MOVED HERE
    await reFreshData();
  } catch (error) {
    console.error("Failed to like event:", error);
    
    // Revert localStorage on error
    if (newHasLiked) {
      localStorage.removeItem(`liked_event_${eventId}`);
    } else {
      localStorage.setItem(`liked_event_${eventId}`, 'true');
    }
    
    // Revert UI state
    setHasLiked(!newHasLiked);
  } finally {
    setIsLoading(false);
  }
};

  if (!mounted) {
    return (
      <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400">
        <Heart className="w-5 h-5" />
        <span className="text-xs font-bold">...</span>
      </button>
    );
  }

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