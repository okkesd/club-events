"use client";

import React from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";

interface CalendarHeaderProps {
    weekHeader: string;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    viewMode: "grid" | "list";
    onToggleView: () => void;
}

export function CalendarHeader({
    weekHeader,
    onPreviousWeek,
    onNextWeek,
    viewMode,
    onToggleView,
}: CalendarHeaderProps) {
    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm shadow-md border-b border-gray-300 dark:border-gray-800 vibrant:border-purple-200 transition-colors">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-100 rounded-lg p-1 transition-colors">
                <button
                    onClick={viewMode !== "grid" ? onToggleView : undefined}
                    aria-label="Grid view"
                    className={`p-1.5 rounded-md transition-all ${
                        viewMode === "grid"
                            ? "bg-white dark:bg-gray-700 vibrant:bg-white text-blue-600 dark:text-blue-400 vibrant:text-purple-600 shadow-sm"
                            : "text-gray-400 dark:text-gray-500 vibrant:text-purple-400 hover:text-gray-600 dark:hover:text-gray-300 vibrant:hover:text-purple-600"
                    }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                    onClick={viewMode !== "list" ? onToggleView : undefined}
                    aria-label="List view"
                    className={`p-1.5 rounded-md transition-all ${
                        viewMode === "list"
                            ? "bg-white dark:bg-gray-700 vibrant:bg-white text-blue-600 dark:text-blue-400 vibrant:text-purple-600 shadow-sm"
                            : "text-gray-400 dark:text-gray-500 vibrant:text-purple-400 hover:text-gray-600 dark:hover:text-gray-300 vibrant:hover:text-purple-600"
                    }`}
                >
                    <List className="w-4 h-4" />
                </button>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={onPreviousWeek}
                    aria-label="Previous week"
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:bg-gray-200 dark:hover:bg-gray-800 vibrant:hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-purple-500 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 vibrant:text-purple-900 w-full md:w-auto text-center">
                    {weekHeader}
                </h2>
                <button
                    onClick={onNextWeek}
                    aria-label="Next week"
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:bg-gray-200 dark:hover:bg-gray-800 vibrant:hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-purple-500 transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Spacer for alignment */}
            <div className="w-[72px]"></div>
        </header>
    );
}
