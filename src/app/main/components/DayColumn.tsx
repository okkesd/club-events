import React from "react";
import { IEvent } from "@/app/lib/types";
import { EventCard } from "@/app/components/EventCard";
import { getCalendarHourSlots, CALENDAR_START_HOUR, CALENDAR_END_HOUR } from '@/app/lib/timeUtils';

const ROW_HEIGHT_REM = 5; // h-20 in tailwind is 5rem

interface DayColumnProps {
    day: Date;
    events: IEvent[];
    isFirstDay: boolean;
}

export function DayColumn({ day, events, isFirstDay }: DayColumnProps) {
    const today = new Date();
    const isToday =
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear();

    const dayOfMonth = day.getDate();
    // Get the 3-letter day name (e.g., "MON")
    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });

    const hourSlots = getCalendarHourSlots();
    const totalGridRows = CALENDAR_END_HOUR - CALENDAR_START_HOUR;

    const validEvents = events.filter(event => {
        const startHour = parseInt(event.startTime.split(':')[0], 10);
        return startHour >= CALENDAR_START_HOUR && startHour < CALENDAR_END_HOUR;
    });

    return (
        <div className="flex flex-col flex-1 h-full min-w-0 bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-gray-800 last:border-r-0 transition-colors">
            {/* --- UPDATED HEADER SECTION --- */}
            <div className="p-2">
                <div className="flex flex-col items-center justify-center py-4 border-b border-slate-200 dark:border-gray-800 mb-5 bg-white dark:bg-gray-900 shadow-lg rounded-md">
                    {/* Day Name (e.g., MON) */}
                    <span className="text-xs font-medium uppercase text-slate-500 dark:text-gray-400 mb-1">
                        {dayName}
                    </span>
                    
                    {/* Date Number (e.g., 26) */}
                    <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full text-2xl font-bold transition-colors
                        ${isToday 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-900 dark:text-white'
                        }
                    `}>
                        {dayOfMonth}
                    </div>
                </div>
            </div>
            {/* ------------------------------ */}
    
            {/* The Grid Area */}
            <div 
                className="grid w-full relative flex-1"
                style={{
                    gridTemplateRows: `repeat(${totalGridRows}, ${ROW_HEIGHT_REM}rem)`,
                    gridTemplateColumns: "1fr" 
                }}
            >
                {/* Layer 1: Background Hour Lines */}
                {hourSlots.map((timeLabel, index) => (
                    <div 
                        key={timeLabel} 
                        className="border-b border-slate-100 dark:border-gray-800/60 relative"
                        style={{ gridRow: index + 1, gridColumn: "1 / -1" }}
                    >
                        {/* Only show time labels on the first column (Left Axis) */}
                        {isFirstDay && (
                            <span className="absolute -left-2 -top-3 w-12 text-right text-xs text-slate-600 dark:text-gray-500 font-medium pr-2 bg-white/0">
                                {timeLabel}
                            </span>
                        )}
                    </div>
                ))}
    
                {/* Layer 2: The Events */}
                {validEvents.map((event) => (
                    <EventCard 
                        key={event.id} 
                        event={event} 
                        showHourLabels={isFirstDay} 
                    />
                ))}
            </div>
        </div>
    );
}