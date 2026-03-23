import React from 'react';
import { IEvent } from "@/app/lib/types";
import Link from 'next/link';
import { Clock } from "lucide-react";
import { CALENDAR_START_HOUR, calculateEndTime } from '@/app/lib/timeUtils';

// Helper to parse time
function parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
}

export function EventCard({ event, showHourLabels }: { event: IEvent, showHourLabels: boolean }) {
    
    // Grid Position Calculation
    const start = parseTime(event.startTime); 
    const end = start + event.duration; 

    // Convert time to Grid Row Index
    // +1 is needed because CSS Grid lines are 1-indexed
    const gridRowStart = (start - CALENDAR_START_HOUR) + 1;
    const gridRowEnd = (end - CALENDAR_START_HOUR) + 1;

    // We can support partial hours (e.g. 10:30) via decimals if the parent grid supports it,
    // otherwise this snaps to the hour.
    // Given the previous setup (repeat rows), this allows decimal mapping if we used calc() or standard grid lines.
    // However, standard CSS grid-row integer syntax requires whole numbers usually unless we use top/height %.
    // To keep it simple based on your prompt's logic:
    const gridStyle: React.CSSProperties = {
        gridRowStart: gridRowStart, 
        gridRowEnd: gridRowEnd,
        gridColumn: '1 / -1', // Span full width of the day column
    };

    const eventEndTime = calculateEndTime(event.startTime, event.duration);

    return (
        <Link
            href={`/event/${event.id}`}
            className="m-1 relative group block hover:z-10 transition-all duration-200"
            style={gridStyle}
        >
            <div className={`
                h-full w-full rounded-md border-l-4 p-2 shadow-sm text-xs overflow-hidden flex flex-col gap-1 transition-colors
                bg-blue-50 border-blue-500 hover:bg-blue-100 hover:shadow-md
                dark:bg-blue-900/20 dark:border-blue-500 dark:hover:bg-blue-900/40
                vibrant:bg-violet-50 vibrant:border-purple-500 vibrant:hover:bg-violet-100 vibrant:hover:shadow-md
            `}>
                {/* Title: Blue-900 (Light) -> Blue-100 (Dark) */}
                <div className="font-bold text-blue-900 dark:text-blue-100 vibrant:text-purple-900 truncate leading-tight">
                    {event.title}
                </div>
                
                {/* Time: Blue-700 (Light) -> Blue-300 (Dark) */}
                <div className="flex items-center text-blue-700 dark:text-blue-300 vibrant:text-purple-700 gap-1 opacity-90">
                    <Clock size={12} />
                    <span className="truncate">
                        {event.startTime} - {eventEndTime}
                    </span>
                </div>
    
                {/* Description */}
                {event.duration >= 1 && (
                    <p className="text-blue-800/70 dark:text-blue-200/60 vibrant:text-purple-800/70 line-clamp-2 mt-1">
                        {event.description || "No description"}
                    </p>
                )}
            </div>
        </Link>
    );
}