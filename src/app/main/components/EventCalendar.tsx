"use client";

import React, { useState, useEffect, useMemo } from "react";
import { IEvent } from "@/app/lib/types";
import { fetchEventsForWeek } from "@/app/lib/api";
import { formatWeekHeader, getWeekDays } from "@/app/lib/dateUtils";
// Assuming CalendarHeader exists, or we render a simple one here
import { CalendarHeader } from "./CalendarHeader"; 
import { DayColumn } from "./DayColumn"; // Updated path to match typical structure
import { ErrorState } from "./ErrorState";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function EventCalendar() {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    // --- Effects ---
    useEffect(() => {
        setIsLoading(true);
        fetchEventsForWeek(currentDate)
            .then((data) => {
                // Assuming data is an array of IEvent based on your logic
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
        const month = (day.getMonth() + 1).toString().padStart(2, '0');
        const dateStr = day.getDate().toString().padStart(2, '0');
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
        <div className="flex flex-col h-full w-full bg-white text-slate-800">
            {/* Header Section */}
            {/* Header Section <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">*/}
                <CalendarHeader
                weekHeader={formatWeekHeader(weekDays)}
                onPreviousWeek={goToPreviousWeek}
                onNextWeek={goToNextWeek}
            />
           {/* </div> */}
           
            {/* Calendar Grid Container */}
            <main className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex h-96 w-full items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    // The Day Columns
                    <div className="grid grid-cols-7 min-w-[1000px] h-full divide-x divide-slate-200">
                        {weekDays.map((day, index) => (
                            <DayColumn
                                key={day.toISOString()}
                                day={day}
                                events={getEventsForDay(day)}
                                isFirstDay={index === 0}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}