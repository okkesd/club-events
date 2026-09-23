"use client";
import {useUI} from "@/i18n/useUI";
import React from "react";
import Link from "next/link";
import { IEvent } from "@/app/lib/types";
import { calculateEndTime } from "@/app/lib/timeUtils";
import { Clock, MapPin } from "lucide-react";

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

    const dayName = day.toLocaleDateString(locale, { weekday: "long" });
    const monthDay = day.toLocaleDateString(locale, { month: "short", day: "numeric" });

    return (
        <div data-today={isToday || undefined}>
            {/* Day Header */}
            <div className="flex items-center gap-3 mb-3">
                <div
                    className={`
                        flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0 transition-colors
                        ${isToday
                            ? "bg-blue-600 text-white vibrant:bg-purple-600"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 vibrant:bg-purple-100 vibrant:text-purple-700"
                        }
                    `}
                >
                    {day.getDate()}
                </div>
                <div>
                    <p className={`text-sm font-bold ${isToday ? "text-blue-600 dark:text-blue-400 vibrant:text-purple-600" : "text-gray-900 dark:text-gray-100 vibrant:text-purple-900"} transition-colors`}>
                        {dayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-400 transition-colors">{monthDay}</p>
                </div>
            </div>

            {/* Events or Empty */}
            {events.length > 0 ? (
                <div className="space-y-2 ml-[52px]">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            href={`/event/${event.id}`}
                            className="group block bg-white dark:bg-gray-900 vibrant:bg-white/80 border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 vibrant:hover:border-purple-400 hover:shadow-md vibrant:hover:shadow-purple-200/50 transition-all"
                        >
                            <div className="flex flex-col md:flex-row items-start gap-2 md:gap-3">
                                {/* Time badge */}
                                <div className="hidden md:block shrink-0 text-center min-w-[56px]">
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 vibrant:text-purple-600">{event.startTime}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                        {calculateEndTime(event.startTime, event.duration)}
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-px self-stretch bg-blue-300 dark:bg-blue-700 vibrant:bg-purple-300 rounded-full" />

                                {/* Content */}
                                <div className="w-full md:w-auto flex-1 min-w-0">
                                    <p className="md:hidden mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400 vibrant:text-purple-600">
                                        {event.startTime} - {calculateEndTime(event.startTime, event.duration)}
                                    </p>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 vibrant:text-purple-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 vibrant:group-hover:text-pink-600 [overflow-wrap:anywhere] md:truncate transition-colors">
                                        {event.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {event.duration}{t("h")}</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{event.location}</span>
                                        </span>
                                    </div>
                                    {event.description && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-1.5">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="ml-[52px] text-sm text-gray-400 dark:text-gray-600 vibrant:text-purple-300 italic transition-colors">
                    {t("No events")}</p>
            )}
        </div>
    );
}
