import React from "react";
import { IEvent } from "@/app/lib/types";
import { formatTime } from "@/app/lib/dateUtils";
import Link from 'next/link'; // Import Link
import { Clock } from "lucide-react";
import { CALENDAR_START_HOUR } from '@/app/lib/timeUtils';

/**
 * Renders a single event card.
 */

/**
 * Parses a "HH:MM" string and returns total hours from midnight.
 * e.g., "10:30" -> 10.5
 * e.g., "14:00" -> 14
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + (minutes / 60);
}

/**
 * A card that calculates its own position on a calendar grid.
 */
export function EventCard({ event, showHourLabels }: { event: IEvent , showHourLabels : boolean}) {
    // --- Grid Position Calculation ---
  
    const start = parseTime(event.startTime); // e.g., 10.0
    const end = parseTime(event.endTime);     // e.g., 11.0
    const duration = end - start;
    
    // 1. Calculate the start row
    // (10:00 - 9:00) + 1 = row 2
    // (14:00 - 9:00) + 1 = row 6
    const gridRowStart = (start - CALENDAR_START_HOUR) + 1;
    
    // 2. Calculate the end row
    // (11:00 - 9:00) + 1 = row 3
    // (16:00 - 9:00) + 1 = row 8
    const gridRowEnd = (end - CALENDAR_START_HOUR) + 1;
  
    // 3. Create the grid-row style string
    // e.g., "2 / 3" (spans row 2)
    // e.g., "6 / 8" (spans rows 6 and 7)
    const gridStyle = {
      gridRow: `${gridRowStart} / ${gridRowEnd}`,
    };


    return (
        <Link
      href={`/event/${event.id}`}
      style={gridStyle}
      //className="relative block p-3 rounded-lg bg-blue-100 border border-blue-300 hover:shadow-lg hover:border-blue-500 transition-all duration-200 ease-in-out cursor-pointer ml-10 mr-1 my-px z-20"    
      className={`relative block p-2 rounded-lg bg-blue-100 border border-blue-300 hover:shadow-lg hover:border-blue-500 transition-all duration-200 ease-in-out cursor-pointer mr-1 my-px z-20 ${
        showHourLabels ? 'ml-10' : 'ml-1' 
      }`}
      >
        {/*<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-bold text-sm text-blue-800">{event.title}</h5>
            <p className="text-xs text-blue-700 mt-1">{event.clubName}</p>
            <p className="text-xs text-blue-600 mt-2">
                {formatTime(startTime)} – {formatTime(endTime)}
            </p>
        </div>*/}
        <div className="flex flex-col">
          {/* Club Name */}
          <span className="text-xs font-semibold text-blue-600 mb-1">
            {event.clubName}
          </span>
          
          {/* Event Title */}
          <span className="text-sm font-bold text-gray-800 mb-2">
            {event.title}
          </span>
          
          {/* Time */}
          {duration > 1 && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Clock className="w-3 h-3" />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
        )}
        </div>
        </Link>
    );
}
