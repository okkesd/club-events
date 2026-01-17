"use client"; // This is the root client component for this page.

import React, { useState, useEffect, useMemo } from "react";
import { IEvent } from "@/app/lib/types";
import { fetchEventsForWeek } from "@/app/lib/api";
import { getWeekDays, formatWeekHeader } from "@/app/lib/dateUtils";
import { CalendarHeader } from "./CalendarHeader";
import { DayColumn } from "@/app/main/components/DayColumn";

export default function EventCalendar() {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    //const [weekDays, setWeekDays] = useState<Date[]>([]);
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    // --- Effects ---
    useEffect(() => {
        setIsLoading(true);
        //const days = getWeekDays(currentDate);
        //setWeekDays(days); // Set weekdays immediately for header

        fetchEventsForWeek(currentDate)
            .then((data) => {
                console.log("data from calendar",data)
                //const allEventsArray = Object.values(data).flat();
                if (data){
                    setEvents(data); // Set the correct flat array
                }
                
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
        //const year = day.getFullYear();
        //const month = (day.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
        const date = day.getDate().toString().padStart(2, '0');
        //const dayString = `${year}-${month}-${date}`;

        return events
            .filter((event) => {
                // 2. FIX: Compare the event's 'date' string (e.g., "2025-10-27")
                // with the 'day' string we want to render.
                return String(event.day) === date;
            })
            .sort(
                (a, b) => {
                    // 3. FIX: Create full, valid date-time strings to compare.
                    // This is more robust than new Date("10:00").
                    const timeA = new Date(`${a.startTime}`).getTime(); // ${a.date}T
                    const timeB = new Date(`${b.startTime}`).getTime(); // ${b.date}T
                    return timeA - timeB;
                }
            );
    };

    // --- Render --- bg-gray-100
    return (
        <div className="flex flex-col  font-inter p-4 bg-gray-100">
            <div className="flex flex-col w-full bg-white rounded-2xl shadow-xl border border-gray-200">
                
                <CalendarHeader
                    weekHeader={formatWeekHeader(weekDays)}
                    onPreviousWeek={goToPreviousWeek}
                    onNextWeek={goToNextWeek}
                />

            <main className="p-4 relative">
                    
                    {/* Loading Overlay: Appears ON TOP of the grid */}
                    {isLoading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-b-2xl transition-all duration-300">
                            <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-semibold text-blue-600">Loading events...</span>
                            </div>
                        </div>
                    )}

                    {/* Grid: Always rendered, maintaining the layout height */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                        {weekDays.map((day, index) => {
                            const dayEvents = getEventsForDay(day);
                            const isToday =
                                new Date().toDateString() ===
                                day.toDateString();

                            return (
                                <DayColumn
                                    key={day.toISOString()}
                                    day={day}
                                    // Optionally pass empty events if you want the cards to vanish instantly during load
                                    // events={isLoading ? [] : dayEvents} 
                                    events={dayEvents}
                                    isToday={isToday}
                                    isFirstDay={index === 0}
                                />
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
