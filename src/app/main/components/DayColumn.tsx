import React from "react";
import { IEvent } from "@/app/lib/types";
import { EventCard } from "@/app/components/EventCard"; // <-- UPDATED PATH
import { formatDate } from '@/app/lib/dateUtils';
import { getCalendarHourSlots, CALENDAR_START_HOUR, CALENDAR_END_HOUR } from '@/app/lib/timeUtils';

/**
 * Renders a single day's column in the weekly calendar.
 */

// Get the hour slots we want to display
const hourSlots = getCalendarHourSlots();
// Calculate the total number of 1-hour rows we need
const totalGridRows = CALENDAR_END_HOUR - CALENDAR_START_HOUR;


interface DayColumnProps {
    day: Date;
    events: IEvent[];
    isToday: boolean;
    isFirstDay: boolean
}

export function DayColumn({ day, events, isToday , isFirstDay }: DayColumnProps) {

    // Get just the day number (e.g., "28")
    const dayOfMonth = day.getDate();
    // Get the short day name (e.g., "Tue")
    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
  
    // Filter events to only include those within our calendar's time range
    const validEvents = events.filter(event => {
      const startHour = parseInt(event.startTime.split(':')[0], 10);
      return startHour >= CALENDAR_START_HOUR && startHour < CALENDAR_END_HOUR;
    });
    
    return (

        <div className="flex flex-col bg-white">
          {/* --- Day Header --- */}
          <div className="text-center py-3 border-b sticky top-0 bg-white z-10">
            <p className="text-sm font-medium text-gray-500">{dayName}</p>
            <p className="text-2xl font-semibold text-blue-600">{dayOfMonth}</p>
          </div>
    
          {/* --- Time Grid Container ---
            This 'relative' container holds two layers:
            1. The background grid with hour lines.
            2. The foreground grid where events are placed.
          */}
          <div className="flex-grow relative">
            
            {/* Layer 1: Background Grid (Hour Labels & Lines) */}
            <div 
              className="grid"
              // Create N rows, each 4rem (64px) high
              style={{ gridTemplateRows: `repeat(${totalGridRows}, 5rem)` }}
            >
              {hourSlots.map((hour) => (
                <div key={hour} className="relative h-20 border-b border-gray-200">
                  {/* Hour Label */}
                  {isFirstDay && (
                    <span className="absolute -top-3 left-1 text-xs font-medium text-gray-400 bg-white pr-2">
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </span>
                  )}
                </div>
              ))}
            </div>
    
            {/* Layer 2: Events Grid (Foreground)
              This grid sits perfectly on top of Layer 1.
              It has the *exact same* grid template, so events will align.
            */}
            <div 
              className="absolute inset-0 grid" 
              style={{ gridTemplateRows: `repeat(${totalGridRows}, 5rem)` }}
            >
              {validEvents.map((event) => (
                <EventCard key={event.id} event={event} showHourLabels={isFirstDay}/>
              ))}
            </div>
            
          </div>
        </div>

        /*<div className="bg-white rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
            {/* Day Header /}
            <div
                className={`p-3 border-b-2 ${
                    isToday ? "border-blue-500" : "border-gray-200"
                }`}
            >
                <h3 className="text-center font-semibold text-gray-700">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                </h3>
                <h4
                    className={`text-center text-2xl font-bold ${
                        isToday ? "text-blue-600" : "text-gray-800"
                    }`}
                >
                    {day.getDate()}
                </h4>
            </div>

            {/* Events List *}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {events.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm pt-4">
                        No events
                    </div>
                ) : (
                    events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))
                )}
            </div>
        </div>*/
    );
}

