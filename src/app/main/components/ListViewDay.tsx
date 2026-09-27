"use client";
import {useUI} from "@/i18n/useUI";
import React from "react";
import Link from "next/link";
import { IEvent } from "@/app/lib/types";
import { calculateEndTime } from "@/app/lib/timeUtils";
import { Clock, MapPin } from "lucide-react";
import ListEventLikeButton from './ListEventLikeButton';

interface ListViewDayProps {
    day: Date;
    events: IEvent[];
}

export function ListViewDay({ day, events }: ListViewDayProps) {
  const {t, locale} = useUI();
    const today = new Date();
    const isToday =
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
        day.getDate() === tomorrow.getDate() &&
        day.getMonth() === tomorrow.getMonth() &&
        day.getFullYear() === tomorrow.getFullYear();

    const dayName = day.toLocaleDateString(locale, { weekday: "long" });
    const monthName = day.toLocaleDateString(locale, { month: "long" });
    const relativeDay = isToday ? t("Today") : isTomorrow ? t("Tomorrow") : null;

    return (
        <div data-today={isToday || undefined}>
            {/* Day Header */}
            <div className="sticky top-[65px] z-20 flex items-center gap-3 mb-3 py-3 bg-white dark:bg-gray-950 vibrant:bg-white border-b border-gray-100 dark:border-gray-800 vibrant:border-campus-border">
                <div
                    className={`
                        flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0 transition-colors
                        ${isToday
                            ? "bg-blue-600 text-white vibrant:bg-campus-accent"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 vibrant:bg-campus-soft vibrant:text-campus-ink"
                        }
                    `}
                >
                    {day.getDate()}
                </div>
                <div>
                    <p className={`text-sm font-bold ${isToday ? "text-blue-600 dark:text-blue-300 vibrant:text-campus-ink" : "text-gray-900 dark:text-gray-50 vibrant:text-gray-900"} transition-colors`}>
                        {relativeDay ? `${relativeDay} (${dayName})` : dayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300 vibrant:text-campus-muted transition-colors">{monthName}</p>
                </div>
            </div>

            {/* Events or Empty */}
            {events.length > 0 ? (
                <div className="space-y-2 ml-[52px]">
                    {events.map((event) => (
                        <div key={event.id} className="group relative">
                        <Link
                            href={`/event/${event.id}`}
                            className="group block bg-white dark:bg-gray-900 vibrant:bg-white/80 border border-gray-200 dark:border-gray-800 vibrant:border-campus-border rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 vibrant:hover:border-campus-gold hover:shadow-md vibrant:hover:shadow-stone-300/50 transition-all"
                        >
                            <div className="flex flex-col md:flex-row items-start gap-2 md:gap-3">
                                {/* Content */}
                                <div className="w-full md:w-auto flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-50 vibrant:text-gray-900 group-hover:text-blue-600 dark:group-hover:text-blue-300 vibrant:group-hover:text-campus-accent [overflow-wrap:anywhere] md:truncate transition-colors">
                                        {event.title}
                                    </h4>
                                    {event.organizerInstagram && (
                                        <p className="mt-1 truncate text-[15px] font-medium text-gray-600 dark:text-gray-200 vibrant:text-campus-ink">@{event.organizerInstagram}</p>
                                    )}
                                    <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-300 vibrant:text-campus-ink">
                                        {event.startTime} - {calculateEndTime(event.startTime, event.duration)}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 pr-9 text-xs text-gray-500 dark:text-gray-300">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {event.duration}{t("h")}</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{event.location}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <ListEventLikeButton eventId={event.id} initialHasLiked={event.hasLiked ?? false} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="ml-[52px] text-sm text-gray-400 dark:text-gray-400 vibrant:text-campus-muted italic transition-colors">
                    {t("No events")}</p>
            )}
        </div>
    );
}
