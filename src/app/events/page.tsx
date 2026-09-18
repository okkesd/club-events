"use client";
import {useUI} from "@/i18n/useUI";


import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search, CalendarDays, MapPin, Clock, Filter, X, Tag as TagIcon, Eye, Heart,
} from "lucide-react";
import { fetchEvents, resolveImageUrl } from "@/app/lib/api";
import { IEvent, IEventFilters, Pagination } from "@/app/lib/types";
import PaginationBar from "@/app/components/PaginationBar";
import StayUpdated from "@/app/components/StayUpdated";

const LOCATION_TYPES = [
  { value: "on-campus", label: "On Campus" },
  { value: "off-campus", label: "Off Campus" },
] as const;

// Helper to get YYYY-MM-DD in local time
const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function EventsBrowsePage() {
  const {t} = useUI();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [locationType, setLocationType] = useState<"on-campus" | "off-campus" | "">("");
  const [dateFrom, setDateFrom] = useState(getLocalDateString(new Date()));
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [activePreset, setActivePreset] = useState<"upcoming" | "1d" | "7d" | "1m" | "all" | "">("upcoming");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleDatePreset = (preset: "upcoming" | "1d" | "7d" | "1m" | "all") => {
    setActivePreset(preset);
    
    if (preset === "all") {
      setDateFrom("");
      setDateTo("");
      setSortOrder("desc");
      return;
    }

    // For all other presets, the start date is always today
    const today = new Date();
    setDateFrom(getLocalDateString(today));
    setSortOrder("asc");

    // Determine the end date based on the preset
    if (preset === "upcoming") {
      // No end date limit, just everything from today onward
      setDateTo(""); 
    } else {
      const targetDate = new Date(today);
      if (preset === "1d") {
        setDateTo(getLocalDateString(targetDate));
      } else if (preset === "7d") {
        targetDate.setDate(today.getDate() + 7);
        setDateTo(getLocalDateString(targetDate));
      } else if (preset === "1m") {
        targetDate.setMonth(today.getMonth() + 1);
        setDateTo(getLocalDateString(targetDate));
      }
    }
  };

  /*const handleManualDateFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
    setActivePreset("");
  };

  const handleManualDateTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
    setActivePreset("");
  };*/

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: IEventFilters = {
        search: search || undefined,
        location_type: locationType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort_order: sortOrder,
        page,
        pageSize: 12,
      };
      const res = await fetchEvents(filters);
      setEvents(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, locationType, dateFrom, dateTo, page, sortOrder]);

  // Debounced search, immediate for other filters
  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, locationType, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch("");
    setLocationType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters = search || locationType || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 vibrant:border-purple-200 py-12 px-4 mb-8 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 vibrant:bg-purple-100 rounded-xl">
              <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400 vibrant:text-purple-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white vibrant:text-purple-900 tracking-tight transition-colors">
              {t("Browse Events")}</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 max-w-2xl transition-colors">
            {t("Discover upcoming events from all campus clubs.")}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t("Search events...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl transition-colors outline-none
                bg-white border border-gray-200 text-gray-900 placeholder-gray-500
                focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:placeholder-gray-400
                dark:focus:ring-blue-900/50 dark:focus:border-blue-500
                vibrant:bg-white/80 vibrant:border-purple-200 vibrant:focus:ring-purple-200 vibrant:focus:border-purple-500"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 vibrant:text-purple-400 shrink-0" />

            {/* Location type */}
            {LOCATION_TYPES.map((lt) => (
              <button
                key={lt.value}
                onClick={() => setLocationType(locationType === lt.value ? "" : lt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  locationType === lt.value
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 vibrant:bg-purple-100 vibrant:text-purple-700 ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-500 vibrant:ring-purple-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-50 vibrant:text-purple-400 hover:bg-gray-200 dark:hover:bg-gray-700 vibrant:hover:bg-purple-100"
                }`}
              >
                <MapPin className="w-3 h-3 inline mr-1" />
                {t(lt.label)}
              </button>
            ))}

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 vibrant:bg-purple-200 mx-1" />

            {/* Date range */}
            <div className="flex flex-wrap items-center gap-2 max-w-full">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 bg-white dark:bg-gray-900 vibrant:bg-white/80 text-gray-700 dark:text-gray-300 vibrant:text-purple-700 outline-none"
                title={t("From date")}
              />
              <span className="text-gray-400 text-xs">{t("to")}</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 bg-white dark:bg-gray-900 vibrant:bg-white/80 text-gray-700 dark:text-gray-300 vibrant:text-purple-700 outline-none"
                title={t("To date")}
              />
            </div>

            {/* Quick Presets */}
  <div className="flex flex-wrap items-center gap-1.5 max-w-full sm:pl-4 sm:border-l border-gray-200 dark:border-gray-700 vibrant:border-purple-200">
    {[
      { id: "upcoming", label: t("Upcoming") },
      { id: "1d", label: t("Today") },
      { id: "7d", label: t("This Week") },
      { id: "1m", label: t("This Month") },
      { id: "all", label: t("All") },
    ].map((preset) => (
      <button
        key={preset.id}
        onClick={() => handleDatePreset(preset.id as any)}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
          activePreset === preset.id
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 vibrant:bg-purple-200 vibrant:text-purple-800 shadow-sm"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 vibrant:text-purple-500 vibrant:hover:bg-purple-100"
        }`}
      >
        {preset.label}
      </button>
    ))}
  </div>

            {hasFilters && (
              <button onClick={clearFilters} className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1">
                <X className="w-3 h-3" />  {t("Clear")}</button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 h-64 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse transition-colors" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => (
                <BrowseEventCard key={event.id} event={event} />
              ))}
            </div>
            {pagination && (
              <PaginationBar pagination={pagination} onPageChange={setPage} />
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <CalendarDays className="w-8 h-8 text-gray-400 dark:text-gray-500 vibrant:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">{t("No events found")}</h3>
            <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-400 mt-2 transition-colors">
              {hasFilters ? t("Try adjusting your filters.") : t("Check back soon for upcoming events.")}
            </p>
          </div>
        )}
        <StayUpdated />
      </div>
    </div>
  );
}

function BrowseEventCard({ event }: { event: IEvent }) {
  const {t, locale} = useUI();
  const eventDate = new Date(event.date + "T00:00:00");
  const monthName = eventDate.toLocaleString(locale, { month: "short" });
  const dayNumber = eventDate.getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Today's events stay active until the next local calendar day.
  const isPast = eventDate.getTime() < today.getTime();

  return (
    <Link
      href={`/event/${event.id}`}
      className={`browse-event-card group block bg-white dark:bg-gray-900 vibrant:bg-white/80 rounded-2xl border overflow-hidden
        border-gray-200 dark:border-gray-800 vibrant:border-purple-200
        ${isPast ? "opacity-60" : ""}
      `}
    >
      {/* Cover image or colored header */}
      {event.coverImage ? (
        <div className="browse-event-cover w-full h-40 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            src={resolveImageUrl(event.coverImage)}
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="browse-event-cover-image block w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 vibrant:from-purple-500 vibrant:to-pink-500" />
      )}

      <div className="p-5">
        {/* Date badge + location type */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 vibrant:bg-purple-50 border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 rounded-lg w-11 h-11 shrink-0 transition-colors">
              <span className="text-[9px] font-bold text-red-500 dark:text-red-400 uppercase leading-none">{monthName}</span>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white leading-none">{dayNumber}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-400 font-medium">
                <Clock className="w-3 h-3 inline mr-0.5" />
                {event.startTime} - {event.endTime}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
            event.locationType === "off-campus"
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          }`}>
            {event.locationType === "off-campus" ? t("Off Campus") : t("On Campus")}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white vibrant:text-purple-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 vibrant:group-hover:text-pink-600 leading-snug mb-1.5 line-clamp-2 transition-colors">
          {event.title}
        </h3>

        {/* Club name */}
        <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-400 mb-3 transition-colors">
          {event.clubName} · {event.location}
        </p>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-50 vibrant:text-purple-500">
                <TagIcon className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">+{event.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 vibrant:text-purple-400">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" /> {event.likes}
          </span>
          {event.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {event.viewCount}
            </span>
          )}
          {event.isRegistrationOpen && (
            <span className="ml-auto text-[10px] font-bold uppercase text-green-600 dark:text-green-400 vibrant:text-green-600">
              {t("Open")}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
