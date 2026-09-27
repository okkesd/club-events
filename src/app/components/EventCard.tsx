"use client";
import React, { useState } from 'react';
import { IEvent } from "@/app/lib/types";
import EventPreviewLink from './EventPreviewLink';
import { Clock, Heart } from "lucide-react";
import { toggleEventLike } from '@/app/lib/api';
import { useUI } from '@/i18n/useUI';
import { CALENDAR_START_HOUR, calculateEndTime } from '@/app/lib/timeUtils';

const ROW_HEIGHT_REM = 4.5; // Matches the parent container's row height

// Helper to parse time
function parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
}

export function EventCard({ 
    event, 
    columnIndex = 0, 
    totalColumns = 1, 
    colSpan = 1,
    startHour = CALENDAR_START_HOUR,
    endHour,
}: { 
    event: IEvent, 
    showHourLabels: boolean, 
    columnIndex?: number, 
    totalColumns?: number, 
    colSpan?: number,
    startHour?: number,
    endHour?: number,
}) {
    const { t } = useUI();
    const [hasLiked, setHasLiked] = useState(event.hasLiked ?? false);
    const [isLiking, setIsLiking] = useState(false);
    const [likeError, setLikeError] = useState(false);

    const handleLike = async () => {
        if (isLiking) return;
        const previous = hasLiked;
        setIsLiking(true);
        setLikeError(false);
        setHasLiked(!previous);
        try {
            const result = await toggleEventLike(event.id);
            setHasLiked(result.hasLiked);
        } catch {
            setHasLiked(previous);
            setLikeError(true);
        } finally {
            setIsLiking(false);
        }
    };
    // 1. Calculate numerical times
    const start = parseTime(event.startTime);
    
    // 2. Calculate Absolute Vertical Positioning (Top and Height)
    const topPositionRem = (start - startHour) * ROW_HEIGHT_REM;
    const visibleDuration = endHour === undefined
        ? event.duration
        : Math.max(0, Math.min(event.duration, endHour - start));
    const heightRem = visibleDuration * ROW_HEIGHT_REM;
    const isCompact = heightRem < 3.75;

    // 3. Calculate Absolute Horizontal Positioning (Left and Width)
    const leftPercentage = (columnIndex / totalColumns) * 100;
    const widthPercentage = (colSpan / totalColumns) * 100;

    const absoluteStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${topPositionRem}rem`,
        height: `${heightRem}rem`,
        left: `${leftPercentage}%`,
        width: `${widthPercentage}%`,
        padding: '2px',
    };

    const eventEndTime = calculateEndTime(event.startTime, event.duration);

    return (
        <div
            className="group block z-10 hover:z-20 focus-within:z-20 rounded-lg transition-all duration-200"
            style={absoluteStyle}
        >
            <div className={`
                gs-event-stripe relative h-full w-full min-w-0 rounded-lg border-l-[3px] px-2 shadow-sm text-xs overflow-hidden flex flex-col transition-colors
                ${heightRem >= ROW_HEIGHT_REM ? 'gap-2' : 'gap-1'}
                ${isCompact ? 'py-1' : 'py-1.5'}
                bg-blue-50 border-blue-500 group-hover:bg-blue-100 group-hover:shadow-md
                dark:bg-blue-950/60 dark:border-blue-400 dark:group-hover:bg-blue-900/60
                vibrant:bg-white vibrant:border-campus-gold vibrant:group-hover:bg-campus-soft vibrant:group-hover:shadow-sm
            `}>
                <EventPreviewLink event={event} />
                {/* Title */}
                <div className={`shrink-0 font-semibold text-blue-950 dark:text-blue-50 vibrant:text-gray-900 leading-4 break-words ${isCompact || (event.organizerInstagram && heightRem < 6) ? 'line-clamp-1' : 'line-clamp-2'}`}>
                    {event.title}
                </div>
                
                {/* Time */}
                {!isCompact && event.organizerInstagram && (
                    <p className="shrink-0 truncate text-[11px] font-medium leading-3 text-blue-700 dark:text-blue-100 vibrant:text-campus-ink">@{event.organizerInstagram}</p>
                )}
                {!isCompact && <div className={`pointer-events-none flex min-w-0 shrink-0 items-center text-[10px] leading-3 text-blue-700 dark:text-blue-200 vibrant:text-campus-ink gap-1 tabular-nums ${visibleDuration > 1 ? '' : 'relative lg:pr-6'}`}>
                    <Clock size={11} className="shrink-0" />
                    <span className="truncate">
                        {event.startTime} - {eventEndTime}
                    </span>
                    <button
                        type="button"
                        onClick={handleLike}
                        disabled={isLiking}
                        aria-label={t("Like event")}
                        aria-pressed={hasLiked}
                        className={`pointer-events-auto absolute hidden items-center justify-center rounded-md transition-colors lg:inline-flex focus-visible:outline-2 focus-visible:outline-rose-500 disabled:cursor-wait ${visibleDuration > 1 ? 'bottom-1 right-1 h-8 w-8' : 'right-0 top-1/2 h-6 w-6 -translate-y-1/2'} ${hasLiked
                            ? 'text-rose-600 dark:text-rose-400 vibrant:text-campus-ink'
                            : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-blue-600 hover:text-rose-600 dark:text-blue-200 dark:hover:text-rose-400 vibrant:text-campus-ink vibrant:hover:text-campus-accent'
                        }`}
                    >
                        <Heart className={`${visibleDuration > 1 ? 'h-5 w-5' : 'h-4 w-4'} ${hasLiked ? 'fill-current' : ''}`} aria-hidden="true" />
                    </button>
                </div>}
                {likeError && <span role="alert" className="sr-only">{t("Failed to like")}</span>}
    
            </div>
        </div>
    );
}
