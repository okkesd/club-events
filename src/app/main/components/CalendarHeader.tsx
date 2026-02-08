"use client"; // This component has onClick handlers, so it's a client component.

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
    weekHeader: string;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
}

export function CalendarHeader({
    weekHeader,
    onPreviousWeek,
    onNextWeek,
}: CalendarHeaderProps) {
    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md border-b border-gray-300 dark:border-gray-800 transition-colors">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 md:text-2xl">
                {/* Title if needed */}
            </h1>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onPreviousWeek}
                    aria-label="Previous week"
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 w-full md:w-auto text-center">
                    {weekHeader}
                </h2>
                <button
                    onClick={onNextWeek}
                    aria-label="Next week"
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
            {/* Placeholder for user profile/login button */}
            <div className="w-24"></div>
        </header>
    );
}
