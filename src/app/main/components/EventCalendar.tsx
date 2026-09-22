"use client";
import {useUI} from "@/i18n/useUI";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { IEvent } from "@/app/lib/types";
import { fetchEventsForWeek } from "@/app/lib/api";
import { formatWeekHeader, getWeekDays } from "@/app/lib/dateUtils";
import { CalendarHeader } from "./CalendarHeader";
import { DayColumn } from "./DayColumn";
import { CalendarListView } from "./CalendarListView";
import { ErrorState } from "./ErrorState";
import { Loader2 } from "lucide-react";
import { useMediaQuery } from "@/app/lib/hooks/useMediaQuery";
import { getCalendarStartHour, CALENDAR_END_HOUR, CALENDAR_MAX_END_HOUR } from "@/app/lib/timeUtils";

const DESKTOP_VIEW_STORAGE_KEY = "calendar-desktop-view";

export default function EventCalendar() {
    const {locale} = useUI();
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    // Default to list on all screens; desktop restores the user's saved view.
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const hasUserToggled = useRef(false);

    useEffect(() => {
        if (!hasUserToggled.current) {
            if (isDesktop) {
                try {
                    const savedView = window.localStorage.getItem(DESKTOP_VIEW_STORAGE_KEY);
                    if (savedView === "grid" || savedView === "list") {
                        setViewMode(savedView);
                        return;
                    }
                } catch {
                    // Storage can be unavailable; keep the list default.
                }
            }
            setViewMode("list");
        }
    }, [isDesktop]);

    const toggleView = () => {
        hasUserToggled.current = true;
        const nextView = viewMode === "grid" ? "list" : "grid";
        setViewMode(nextView);
        if (isDesktop) {
            try {
                window.localStorage.setItem(DESKTOP_VIEW_STORAGE_KEY, nextView);
            } catch {
                // Switching views still works when storage is unavailable.
            }
        }
    };

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const calendarStartHour = getCalendarStartHour(events);
    const calendarEndHour = events.reduce((endHour, event) => {
        const [hours, minutes] = event.startTime.split(":").map(Number);
        const start = hours + minutes / 60;
        const end = start + event.duration;
        return start >= calendarStartHour && Number.isFinite(end)
            ? Math.min(CALENDAR_MAX_END_HOUR, Math.max(endHour, Math.ceil(end)))
            : endHour;
    }, CALENDAR_END_HOUR);

    // --- Effects ---
    useEffect(() => {
        setIsLoading(true);
        fetchEventsForWeek(currentDate)
            .then((data) => {
                if (data) {
                    setEvents(data);
                    setError(null);
                } else {
                    setError("Failed to connect server!");
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch events:", err);
                setIsLoading(false);
                setError("Failed to connect server!");
            });
    }, [currentDate]);

    // --- Event Handlers ---
    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    // --- Helper for Rendering ---
    const getEventsForDay = (day: Date): IEvent[] => {
        const year = day.getFullYear();
        const month = (day.getMonth() + 1).toString().padStart(2, "0");
        const dateStr = day.getDate().toString().padStart(2, "0");
        const currentDayString = `${year}-${month}-${dateStr}`;

        return events
            .filter((event) => event.date === currentDayString)
            .sort((a, b) => {
                const dateTimeA = `${a.date}T${a.startTime}`;
                const dateTimeB = `${b.date}T${b.startTime}`;
                return new Date(dateTimeA).getTime() - new Date(dateTimeB).getTime();
            });
    };

    // --- Render ---
    if (error) return <ErrorState message={error} retry={() => setCurrentDate(new Date(currentDate))} />;

    return (
        <div className="flex flex-col w-full bg-white dark:bg-gray-950 vibrant:bg-transparent text-slate-800 dark:text-gray-100 vibrant:text-indigo-950 transition-colors duration-300">
            {/* Header Section */}
            <CalendarHeader
                weekHeader={formatWeekHeader(weekDays, false, locale)}
                mobileWeekHeader={formatWeekHeader(weekDays, true, locale)}
                onPreviousWeek={goToPreviousWeek}
                onNextWeek={goToNextWeek}
                viewMode={viewMode}
                onToggleView={toggleView}
            />

            {/* Calendar Content */}
            <div>
                {isLoading ? (
                    <div className="flex h-96 w-full items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : viewMode === "grid" ? (
                    // Grid View (original 7-column calendar)
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-7 min-w-[1000px] divide-x divide-slate-300 dark:divide-gray-700 vibrant:divide-purple-300">
                            {weekDays.map((day, index) => (
                                <DayColumn
                                    key={day.toISOString()}
                                    day={day}
                                    events={getEventsForDay(day)}
                                    isFirstDay={index === 0}
                                    startHour={calendarStartHour}
                                    endHour={calendarEndHour}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    // List View (mobile-friendly agenda)
                    <CalendarListView
                        weekDays={weekDays}
                        getEventsForDay={getEventsForDay}
                    />
                )}
            </div>
        </div>
    );
}
