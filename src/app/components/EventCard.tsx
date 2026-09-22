"use client";
import React from 'react';
import { IEvent } from "@/app/lib/types";
import Link from 'next/link';
import { Clock } from "lucide-react";
import { CALENDAR_START_HOUR, calculateEndTime } from '@/app/lib/timeUtils';

const ROW_HEIGHT_REM = 5; // Matches the parent container's row height

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
    // 1. Calculate numerical times
    const start = parseTime(event.startTime);
    
    // 2. Calculate Absolute Vertical Positioning (Top and Height)
    const topPositionRem = (start - startHour) * ROW_HEIGHT_REM;
    const visibleDuration = endHour === undefined
        ? event.duration
        : Math.max(0, Math.min(event.duration, endHour - start));
    const heightRem = visibleDuration * ROW_HEIGHT_REM;
    const isCompact = visibleDuration < 0.75;
    const showDescription = visibleDuration >= 1.5 && Boolean(event.description);

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
        <Link
            href={`/event/${event.id}`}
            title={`${event.title}\n${event.startTime} - ${eventEndTime}`}
            aria-label={`${event.title}, ${event.startTime} - ${eventEndTime}`}
            className="group block z-10 hover:z-20 focus-visible:z-20 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all duration-200"
            style={absoluteStyle}
        >
            <div className={`
                h-full w-full min-w-0 rounded-lg border-l-[3px] px-2 shadow-sm text-xs overflow-hidden flex flex-col gap-1 transition-colors
                ${isCompact ? 'py-1' : 'py-1.5'}
                bg-blue-50 border-blue-500 group-hover:bg-blue-100 group-hover:shadow-md
                dark:bg-blue-950/60 dark:border-blue-400 dark:group-hover:bg-blue-900/60
                vibrant:bg-violet-50 vibrant:border-purple-500 vibrant:hover:bg-violet-100 vibrant:hover:shadow-md
            `}>
                {/* Title */}
                <div className={`shrink-0 font-semibold text-blue-950 dark:text-blue-100 vibrant:text-purple-900 leading-4 break-words ${isCompact ? 'line-clamp-1' : 'line-clamp-2'}`}>
                    {event.title}
                </div>
                
                {/* Time */}
                {!isCompact && <div className="flex min-w-0 shrink-0 items-center text-[10px] leading-3 text-blue-700 dark:text-blue-300 vibrant:text-purple-700 gap-1 tabular-nums">
                    <Clock size={11} className="shrink-0" />
                    <span className="truncate">
                        {event.startTime} - {eventEndTime}
                    </span>
                </div>}
    
                {/* Use the visible height, including clipping at the calendar boundary. */}
                {showDescription && (
                    <p className="shrink-0 text-blue-800/70 dark:text-blue-200/70 vibrant:text-purple-800/70 line-clamp-2 leading-4 mt-1">
                        {event.description}
                    </p>
                )}
            </div>
        </Link>
    );
}
