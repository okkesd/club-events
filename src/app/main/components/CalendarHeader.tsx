"use client";
import {useUI} from "@/i18n/useUI";


import React from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";

interface CalendarHeaderProps {
    weekHeader: string;
    mobileWeekHeader: string;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    viewMode: "grid" | "list";
    onToggleView: () => void;
}

export function CalendarHeader({
    weekHeader,
    mobileWeekHeader,
    onPreviousWeek,
    onNextWeek,
    viewMode,
    onToggleView,
}: CalendarHeaderProps) {
  const {t} = useUI();
    return (
        <header className="flex flex-col gap-2 md:flex-row md:gap-0 items-center justify-between p-4 bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm shadow-md border-b border-gray-300 dark:border-gray-800 vibrant:border-purple-200 transition-colors">
            {/* View Toggle */}
            <div className="order-2 md:order-none flex items-center gap-1 border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-gray-950 vibrant:border-purple-300 vibrant:bg-purple-100 rounded-xl p-1 shadow-sm transition-colors">
                <button
                    onClick={viewMode !== "grid" ? onToggleView : undefined}
                    aria-label={t("Grid view")}
                    aria-pressed={viewMode === "grid"}
                    className={`flex items-center justify-center p-1.5 md:min-h-9 md:gap-1.5 md:px-2.5 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 vibrant:focus-visible:ring-purple-500 transition-colors ${
                        viewMode === "grid"
                            ? "bg-blue-600 text-white dark:bg-blue-500 vibrant:bg-purple-600 shadow-sm"
                            : "text-blue-800 dark:text-blue-200 vibrant:text-purple-800 hover:bg-blue-100 dark:hover:bg-gray-800 vibrant:hover:bg-purple-200"
                    }`}
                >
                    <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="hidden md:inline">{t("Grid view")}</span>
                </button>
                <button
                    onClick={viewMode !== "list" ? onToggleView : undefined}
                    aria-label={t("List view")}
                    aria-pressed={viewMode === "list"}
                    className={`flex items-center justify-center p-1.5 md:min-h-9 md:gap-1.5 md:px-2.5 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 vibrant:focus-visible:ring-purple-500 transition-colors ${
                        viewMode === "list"
                            ? "bg-blue-600 text-white dark:bg-blue-500 vibrant:bg-purple-600 shadow-sm"
                            : "text-blue-800 dark:text-blue-200 vibrant:text-purple-800 hover:bg-blue-100 dark:hover:bg-gray-800 vibrant:hover:bg-purple-200"
                    }`}
                >
                    <List className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="hidden md:inline">{t("List view")}</span>
                </button>
            </div>

            {/* Week Navigation */}
            <div className="order-1 md:order-none flex w-full md:w-auto items-center justify-between md:justify-normal md:space-x-2">
                <button
                    onClick={onPreviousWeek}
                    aria-label={t("Previous week")}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:bg-gray-200 dark:hover:bg-gray-800 vibrant:hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-purple-500 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm min-[375px]:text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 vibrant:text-purple-900 md:w-auto text-center">
                    <span className="whitespace-nowrap md:hidden">{mobileWeekHeader}</span>
                    <span className="hidden md:inline">{weekHeader}</span>
                </h2>
                <button
                    onClick={onNextWeek}
                    aria-label={t("Next week")}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:bg-gray-200 dark:hover:bg-gray-800 vibrant:hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-purple-500 transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Spacer for alignment */}
            <div className="hidden md:block w-[72px]"></div>
        </header>
    );
}
