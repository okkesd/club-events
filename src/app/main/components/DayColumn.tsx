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

function parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
}

interface LayoutInfo {
    columnIndex: number;
    totalColumns: number;
    colSpan: number;
}

/**
 * Compute side-by-side layout for overlapping events.
 * Events expand rightward into free columns when possible.
 */
function computeOverlapLayout(events: IEvent[]): Map<string, LayoutInfo> {
    const result = new Map<string, LayoutInfo>();
    if (events.length === 0) return result;

    // Sort by start time, then by duration descending (longer events first)
    const sorted = [...events].sort((a, b) => {
        const startA = parseTime(a.startTime);
        const startB = parseTime(b.startTime);
        if (startA !== startB) return startA - startB;
        return b.duration - a.duration;
    });

    // Group overlapping events into isolated clusters
    const clusters: { event: IEvent; start: number; end: number; col: number }[][] = [];
    let currentCluster: { event: IEvent; start: number; end: number; col: number }[] = [];
    let clusterMaxEnd = -1;

    for (const event of sorted) {
        const start = parseTime(event.startTime);
        const end = start + event.duration;

        // If the current event starts after the cluster's max end time, start a new cluster
        if (currentCluster.length > 0 && start >= clusterMaxEnd) {
            clusters.push(currentCluster);
            currentCluster = [];
            clusterMaxEnd = -1;
        }

        // Greedy column assignment within the current cluster
        let col = 0;
        while (currentCluster.some(p => p.col === col && start < p.end && end > p.start)) {
            col++;
        }

        currentCluster.push({ event, start, end, col });
        clusterMaxEnd = Math.max(clusterMaxEnd, end);
    }
    
    if (currentCluster.length > 0) {
        clusters.push(currentCluster);
    }

    // Process layout logic per cluster instead of globally
    for (const cluster of clusters) {
        // Find max columns just for this specific time block
        const clusterMaxCol = Math.max(...cluster.map(p => p.col)) + 1;

        for (const item of cluster) {
            let span = 1;
            // Expand rightward into free columns within the cluster's bounds
            for (let nextCol = item.col + 1; nextCol < clusterMaxCol; nextCol++) {
                const blocked = cluster.some(
                    p => p.col === nextCol && p.start < item.end && p.end > item.start
                );
                if (blocked) break;
                span++;
            }

            result.set(item.event.id, {
                columnIndex: item.col,
                totalColumns: clusterMaxCol,
                colSpan: span,
            });
        }
    }

    return result;
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

    const overlapLayout = computeOverlapLayout(validEvents);

    return (
        <div className="flex flex-col flex-1 h-full min-w-0 bg-white dark:bg-gray-950 vibrant:bg-white/50 border-r border-slate-200 dark:border-gray-800 vibrant:border-purple-200 last:border-r-0 transition-colors">
            {/* --- UPDATED HEADER SECTION --- */}
            <div className="p-2">
                <div className="flex flex-col items-center justify-center py-4 border-b border-slate-200 dark:border-gray-800 vibrant:border-purple-200 mb-5 bg-white dark:bg-gray-900 vibrant:bg-white/80 shadow-lg rounded-md">
                    {/* Day Name (e.g., MON) */}
                    <span className="text-xs font-medium uppercase text-slate-500 dark:text-gray-400 vibrant:text-purple-500 mb-1">
                        {dayName}
                    </span>
                    
                    {/* Date Number (e.g., 26) */}
                    <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full text-2xl font-bold transition-colors
                        ${isToday
                            ? 'bg-blue-600 text-white vibrant:bg-purple-600'
                            : 'text-slate-900 dark:text-white vibrant:text-purple-900'
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
                        className="border-b border-slate-100 dark:border-gray-800/60 vibrant:border-purple-100 relative"
                        style={{ gridRow: index + 1, gridColumn: "1 / -1" }}
                    >
                        {/* Only show time labels on the first column (Left Axis) */}
                        {isFirstDay && (
                            <span className="absolute -left-2 -top-3 w-12 text-right text-xs text-slate-600 dark:text-gray-500 vibrant:text-purple-500 font-medium pr-2 bg-white/0">
                                {timeLabel}
                            </span>
                        )}
                    </div>
                ))}
    
                {/* Layer 2: The Events */}
                {validEvents.map((event) => {
                    const layout = overlapLayout.get(event.id);
                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            showHourLabels={isFirstDay}
                            columnIndex={layout?.columnIndex ?? 0}
                            totalColumns={layout?.totalColumns ?? 1}
                            colSpan={layout?.colSpan ?? 1}
                        />
                    );
                })}
            </div>
        </div>
    );
}