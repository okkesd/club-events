"use client"; // This is the root client component for this page.

import React, { useState, useEffect } from "react";
import { IEvent } from "@/app/lib/types";
import { fetchEventsForWeek } from "@/app/lib/api";
import { getWeekDays, formatWeekHeader } from "@/app/lib/dateUtils";
import { CalendarHeader } from "./CalendarHeader";
import { DayColumn } from "@/app/main/components/DayColumn";

export default function EventCalendar() {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekDays, setWeekDays] = useState<Date[]>([]);
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Effects ---
    useEffect(() => {
        setIsLoading(true);
        const days = getWeekDays(currentDate);
        setWeekDays(days); // Set weekdays immediately for header

        fetchEventsForWeek(days[0])
            .then((data) => {

                const allEventsArray = Object.values(data).flat();

                setEvents(allEventsArray); // Set the correct flat array
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch events:", err);
                setIsLoading(false);
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
        // 1. Get the date string in 'YYYY-MM-DD' format from the 'day' object.
        // This is the correct format to compare with event.date
        //const dayString = day.toISOString().split('T')[0];
        const year = day.getFullYear();
        const month = (day.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
        const date = day.getDate().toString().padStart(2, '0');
        const dayString = `${year}-${month}-${date}`;

        return events
            .filter((event) => {
                // 2. FIX: Compare the event's 'date' string (e.g., "2025-10-27")
                // with the 'day' string we want to render.
                return event.date === dayString;
            })
            .sort(
                (a, b) => {
                    // 3. FIX: Create full, valid date-time strings to compare.
                    // This is more robust than new Date("10:00").
                    const timeA = new Date(`${a.date}T${a.startTime}`).getTime();
                    const timeB = new Date(`${b.date}T${b.startTime}`).getTime();
                    return timeA - timeB;
                }
            );
    };

    // --- Render ---
    return (
        <div className="flex flex-col flex-grow bg-gray-100 font-inter">
            <CalendarHeader
                weekHeader={formatWeekHeader(weekDays)}
                onPreviousWeek={goToPreviousWeek}
                onNextWeek={goToNextWeek}
            />

            <main className="flex-1 overflow-auto p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-lg text-gray-600">
                            Loading events...
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 h-full">
                        {weekDays.map((day, index) => {
                            const dayEvents = getEventsForDay(day);
                            const isToday =
                                new Date().toDateString() ===
                                day.toDateString();

                            return (
                                <DayColumn
                                    key={day.toISOString()}
                                    day={day}
                                    events={dayEvents}
                                    isToday={isToday}
                                    isFirstDay={index === 0}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
