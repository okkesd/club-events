"use client"; // This is the root client component for this page.

import React, { useState, useEffect, useMemo } from "react";
import { IEvent, IEventComplex } from "@/app/lib/types";
import { fetchEventsForWeek } from "@/app/lib/api";
import { getWeekDays, formatWeekHeader } from "@/app/lib/dateUtils";
import { CalendarHeader } from "./CalendarHeader";
import { DayColumn } from "@/app/main/components/DayColumn";
import { ErrorState } from "./ErrorState";

export default function EventCalendar() {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    //const [weekDays, setWeekDays] = useState<Date[]>([]);
    const [events, setEvents] = useState<IEventComplex[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null)

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
                    setError(null)
                } else {
                    setError("Failed to connect server!")
                }
                
                setIsLoading(false);

            })
            .catch((err) => {
                console.error("Failed to fetch events:", err);
                setIsLoading(false);
                setError("Failed to connect server!")
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
    const getEventsForDay = (day: Date): IEventComplex[] => {
    // 1. Get the 'YYYY-MM-DD' string for the column being rendered
        const year = day.getFullYear();
        const month = (day.getMonth() + 1).toString().padStart(2, '0');
        const dateStr = day.getDate().toString().padStart(2, '0');
        const currentDayString = `${year}-${month}-${dateStr}`;
    
        return events
            .filter((event) => {
                // Backend sends 'date' as "YYYY-MM-DD"
                return event.date === currentDayString;
            })
            .sort((a, b) => {
                // 3. FIX: Construct a full ISO timestamp so Date() doesn't crash
                // Format: "2026-01-18T14:00"
                const dateTimeA = `${a.date}T${a.startTime}`;
                const dateTimeB = `${b.date}T${b.startTime}`;
                
                return new Date(dateTimeA).getTime() - new Date(dateTimeB).getTime();
            });
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
                    {
                        error==null ? (
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
                                    isFirstDay={index === 0}
                                />
                            );
                        })}
                    </div>
                        ) : 
                        <div className="col-span-1 md:col-span-7"> {/* Ensure it spans full width */}
                            <ErrorState 
                                message={typeof error === 'string' ? error : "Unknown error"}
                                onRetry={() => {
                                    // Quickest way to retry: clear error and re-trigger the useEffect
                                    // You might need to toggle a dummy state or just reset currentDate
                                    const current = new Date(currentDate); 
                                    setCurrentDate(new Date(current.getTime())); // Force re-render/fetch
                                }} 
                            />
                        </div>
                    }
                    
                </main>
            </div>
        </div>
    );
}
