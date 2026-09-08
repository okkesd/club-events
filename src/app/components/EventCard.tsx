"use client";
import {useUI} from "@/i18n/useUI";
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
    showHourLabels, 
    columnIndex = 0, 
    totalColumns = 1, 
    colSpan = 1,
    endHour,
}: { 
    event: IEvent, 
    showHourLabels: boolean, 
    columnIndex?: number, 
    totalColumns?: number, 
    colSpan?: number,
    endHour?: number,
}) {
  const {t} = useUI();
    // 1. Calculate numerical times
    const start = parseTime(event.startTime);
    
    // 2. Calculate Absolute Vertical Positioning (Top and Height)
    const topPositionRem = (start - CALENDAR_START_HOUR) * ROW_HEIGHT_REM;
    const visibleDuration = endHour === undefined
        ? event.duration
        : Math.max(0, Math.min(event.duration, endHour - start));
    const heightRem = visibleDuration * ROW_HEIGHT_REM;

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
        zIndex: 10, // Ensure events float above the background grid lines
    };

    const eventEndTime = calculateEndTime(event.startTime, event.duration);

    return (
        <Link
            href={`/event/${event.id}`}
            className="group block hover:z-20 transition-all duration-200"
            style={absoluteStyle}
        >
            <div className={`
                h-full w-full rounded-md border-l-4 p-2 shadow-sm text-xs overflow-hidden flex flex-col gap-1 transition-colors
                bg-blue-50 border-blue-500 hover:bg-blue-100 hover:shadow-md
                dark:bg-blue-900/20 dark:border-blue-500 dark:hover:bg-blue-900/40
                vibrant:bg-violet-50 vibrant:border-purple-500 vibrant:hover:bg-violet-100 vibrant:hover:shadow-md
            `}>
                {/* Title */}
                <div className="font-bold text-blue-900 dark:text-blue-100 vibrant:text-purple-900 truncate leading-tight">
                    {event.title}
                </div>
                
                {/* Time */}
                <div className="flex items-center text-blue-700 dark:text-blue-300 vibrant:text-purple-700 gap-1 opacity-90">
                    <Clock size={12} />
                    <span className="truncate">
                        {event.startTime} - {eventEndTime}
                    </span>
                </div>
    
                {/* Description - only show if there is enough vertical space (e.g., duration > 0.5 hours) */}
                {event.duration > 0.5 && (
                    <p className="text-blue-800/70 dark:text-blue-200/60 vibrant:text-purple-800/70 line-clamp-2 mt-1">
                        {event.description || t("No description")}
                    </p>
                )}
            </div>
        </Link>
    );
}
