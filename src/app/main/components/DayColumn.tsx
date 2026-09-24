"use client";
import {useUI} from "@/i18n/useUI";


import { useState } from "react";
import { IEvent } from "@/app/lib/types";
import { EventCard } from "@/app/components/EventCard";
import { getCalendarHourSlots, calculateEndTime } from '@/app/lib/timeUtils';
import Link from 'next/link';
import { Clock, X } from "lucide-react";

const ROW_HEIGHT_REM = 4.5; // Keep in sync with EventCard's row height.
const MAX_VISIBLE_EVENTS = 3;

interface DayColumnProps {
    day: Date;
    events: IEvent[];
    isFirstDay: boolean;
    startHour: number;
    endHour: number;
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

interface ClusterInfo {
    events: IEvent[];
    visibleEvents: IEvent[];
    hiddenCount: number;
    minStart: number;
    maxEnd: number;
}

/**
 * Compute side-by-side layout for overlapping events.
 * Clusters with >3 events are capped — only the first 3 are laid out.
 */
function computeOverlapLayout(events: IEvent[]): { layout: Map<string, LayoutInfo>; clusters: ClusterInfo[] } {
    const layout = new Map<string, LayoutInfo>();
    const clusterInfos: ClusterInfo[] = [];

    if (events.length === 0) return { layout, clusters: clusterInfos };

    // Sort by start time, then by duration descending (longer events first)
    const sorted = [...events].sort((a, b) => {
        const startA = parseTime(a.startTime);
        const startB = parseTime(b.startTime);
        if (startA !== startB) return startA - startB;
        return b.duration - a.duration;
    });

    // Group overlapping events into isolated clusters
    const rawClusters: IEvent[][] = [];
    let currentCluster: IEvent[] = [];
    let clusterMaxEnd = -1;

    for (const event of sorted) {
        const start = parseTime(event.startTime);
        const end = start + event.duration;

        if (currentCluster.length > 0 && start >= clusterMaxEnd) {
            rawClusters.push(currentCluster);
            currentCluster = [];
            clusterMaxEnd = -1;
        }

        currentCluster.push(event);
        clusterMaxEnd = Math.max(clusterMaxEnd, end);
    }
    if (currentCluster.length > 0) {
        rawClusters.push(currentCluster);
    }

    // Process each cluster
    for (const cluster of rawClusters) {
        const isCrowded = cluster.length > MAX_VISIBLE_EVENTS;
        const visibleEvents = isCrowded ? cluster.slice(0, MAX_VISIBLE_EVENTS) : cluster;

        const minStart = Math.min(...cluster.map(e => parseTime(e.startTime)));
        const maxEnd = Math.max(...cluster.map(e => parseTime(e.startTime) + e.duration));

        clusterInfos.push({
            events: cluster,
            visibleEvents,
            hiddenCount: cluster.length - visibleEvents.length,
            minStart,
            maxEnd,
        });

        // Compute layout for visible events only
        const layoutSorted = [...visibleEvents].sort((a, b) => {
            const startA = parseTime(a.startTime);
            const startB = parseTime(b.startTime);
            if (startA !== startB) return startA - startB;
            return b.duration - a.duration;
        });

        const placed: { event: IEvent; start: number; end: number; col: number }[] = [];

        for (const event of layoutSorted) {
            const start = parseTime(event.startTime);
            const end = start + event.duration;

            let col = 0;
            while (placed.some(p => p.col === col && start < p.end && end > p.start)) {
                col++;
            }
            placed.push({ event, start, end, col });
        }

        const maxCol = placed.length > 0 ? Math.max(...placed.map(p => p.col)) + 1 : 1;

        for (const item of placed) {
            let span = 1;
            for (let nextCol = item.col + 1; nextCol < maxCol; nextCol++) {
                const blocked = placed.some(
                    p => p.col === nextCol && p.start < item.end && p.end > item.start
                );
                if (blocked) break;
                span++;
            }

            layout.set(item.event.id, {
                columnIndex: item.col,
                totalColumns: maxCol,
                colSpan: span,
            });
        }
    }

    return { layout, clusters: clusterInfos };
}

/** Modal that shows all events in a crowded time slot */
function OverflowModal({ events, onClose }: { events: IEvent[]; onClose: () => void }) {
  const {t} = useUI();
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 vibrant:bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col relative border border-transparent dark:border-gray-700 vibrant:border-purple-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 vibrant:border-purple-100">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white vibrant:text-purple-900">
                        {t("{count} overlapping events", {count: events.length})}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700 vibrant:hover:bg-purple-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Event list */}
                <div className="overflow-y-auto p-4 space-y-3">
                    {events.map(event => (
                        <Link
                            key={event.id}
                            href={`/event/${event.id}`}
                            className="block rounded-xl border-l-4 p-3 transition-colors
                                bg-blue-50 border-blue-500 hover:bg-blue-100
                                dark:bg-blue-900/20 dark:border-blue-500 dark:hover:bg-blue-900/40
                                vibrant:bg-violet-50 vibrant:border-purple-500 vibrant:hover:bg-violet-100"
                        >
                            <div className="font-semibold text-blue-900 dark:text-blue-100 vibrant:text-purple-900 truncate">
                                {event.title}
                            </div>
                            <div className="flex items-center text-sm text-blue-700 dark:text-blue-300 vibrant:text-purple-700 gap-1 mt-1">
                                <Clock size={14} />
                                <span>{event.startTime} - {calculateEndTime(event.startTime, event.duration)}</span>
                            </div>
                            {event.description && (
                                <p className="text-sm text-blue-800/70 dark:text-blue-200/60 vibrant:text-purple-800/70 line-clamp-2 mt-1">
                                    {event.description}
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DayColumn({ day, events, isFirstDay, startHour, endHour }: DayColumnProps) {
  const {t, locale} = useUI();
    const [modalCluster, setModalCluster] = useState<ClusterInfo | null>(null);

    const today = new Date();
    const isToday =
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear();

    const dayOfMonth = day.getDate();
    const dayName = day.toLocaleDateString(locale, { weekday: 'short' });

    const hourSlots = getCalendarHourSlots(endHour, startHour);
    const totalGridRows = endHour - startHour;

    const validEvents = events.filter(event => {
        const start = parseTime(event.startTime);
        return start >= startHour && start < endHour;
    });

    const { layout: overlapLayout, clusters } = computeOverlapLayout(validEvents);

    // Collect IDs of all visible events across all clusters
    const visibleEventIds = new Set(clusters.flatMap(c => c.visibleEvents.map(e => e.id)));

    // Crowded clusters that need a "+N more" button
    const crowdedClusters = clusters.filter(c => c.hiddenCount > 0);

    return (
        <div className="flex flex-col flex-1 h-full min-w-0 bg-white dark:bg-gray-950 vibrant:bg-white/50 transition-colors">
            {/* Header */}
            <div className="p-2">
                <div className="flex flex-col items-center justify-center py-3 border-b border-slate-200 dark:border-gray-800 vibrant:border-purple-200 mb-3 bg-white dark:bg-gray-900 vibrant:bg-white/80 shadow-lg rounded-md">
                    <span className="text-xs font-medium uppercase text-slate-500 dark:text-gray-400 vibrant:text-purple-500 mb-1">
                        {dayName}
                    </span>
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
                        {isFirstDay && (
                            <span className="absolute -left-2 -top-3 w-12 text-right text-xs text-slate-600 dark:text-gray-500 vibrant:text-purple-500 font-medium pr-2 bg-white/0">
                                {timeLabel}
                            </span>
                        )}
                    </div>
                ))}

                {/* Layer 2: Visible Events */}
                {validEvents.filter(e => visibleEventIds.has(e.id)).map((event) => {
                    const layoutInfo = overlapLayout.get(event.id);
                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            showHourLabels={isFirstDay}
                            columnIndex={layoutInfo?.columnIndex ?? 0}
                            totalColumns={layoutInfo?.totalColumns ?? 1}
                            colSpan={layoutInfo?.colSpan ?? 1}
                            startHour={startHour}
                            endHour={endHour}
                        />
                    );
                })}

                {/* Layer 3: "+N more" buttons for crowded clusters */}
                {crowdedClusters.map((cluster, idx) => {
                    // Position the button at the bottom of the cluster area
                    const topRem = (Math.min(cluster.maxEnd, endHour) - startHour) * ROW_HEIGHT_REM - 1.75;
                    return (
                        <button
                            key={idx}
                            onClick={() => setModalCluster(cluster)}
                            className="absolute right-1 z-30 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-all
                                bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg
                                dark:bg-blue-500 dark:hover:bg-blue-400
                                vibrant:bg-purple-600 vibrant:hover:bg-purple-500"
                            style={{ top: `${topRem}rem` }}
                        >
                            +{t("{count} more", {count: cluster.hiddenCount})}</button>
                    );
                })}
            </div>

            {/* Overflow Modal */}
            {modalCluster && (
                <OverflowModal
                    events={modalCluster.events}
                    onClose={() => setModalCluster(null)}
                />
            )}
        </div>
    );
}
