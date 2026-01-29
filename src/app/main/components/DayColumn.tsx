import React from "react";
import { IEventComplex } from "@/app/lib/types";
import { EventCard } from "@/app/components/EventCard";
import { getCalendarHourSlots, CALENDAR_START_HOUR, CALENDAR_END_HOUR } from '@/app/lib/timeUtils';

// --- CONSTANTS ---
// This must match the height in 'gridTemplateRows' (5rem = h-20)
const ROW_HEIGHT_REM = 5; 

interface DayColumnProps {
    day: Date;
    events: IEventComplex[];
    isFirstDay: boolean; // We still need this to know if we should show the "09:00" labels on the left
}

export function DayColumn({ day, events, isFirstDay }: DayColumnProps) {

    // 1. Calculate "isToday" internally
    const today = new Date();
    const isToday = 
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear();

    // 2. Date Formatting
    const dayOfMonth = day.getDate();
    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });

    // 3. Grid Setup
    const hourSlots = getCalendarHourSlots();
    const totalGridRows = CALENDAR_END_HOUR - CALENDAR_START_HOUR;

    // 4. Filter events for this day
    const validEvents = events.filter(event => {
        const startHour = parseInt(event.startTime.split(':')[0], 10);
        return startHour >= CALENDAR_START_HOUR && startHour < CALENDAR_END_HOUR;
    });

    return (
        <div className={`flex flex-col h-full border-r border-gray-100 min-w-[150px] ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}>
            
            {/* --- Day Header (Sticky) --- */}
            <div className="text-center py-3 border-b border-gray-100 sticky top-0 bg-white z-10 shadow-sm">
                <p className={`text-sm font-medium uppercase ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {dayName}
                </p>
                <div className="flex justify-center items-center mt-1">
                    <span className={`text-2xl font-bold flex items-center justify-center w-10 h-10 rounded-full ${
                        isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-800'
                    }`}>
                        {dayOfMonth}
                    </span>
                </div>
            </div>
    
            {/* --- Time Grid Container --- */}
            <div className="flex-grow relative">
                
                {/* Layer 1: Background Grid (Hour Labels & Lines) */}
                <div 
                    className="grid w-full"
                    style={{ gridTemplateRows: `repeat(${totalGridRows}, ${ROW_HEIGHT_REM}rem)` }}
                >
                    {hourSlots.map((hour) => (
                        <div key={hour} className="relative border-b border-gray-100 box-border">
                            {/* Axis Labels (Only on the very first column of the week) */}
                            {isFirstDay && (
                                <span className="absolute -top-3 left-1 text-xs font-semibold text-gray-400 bg-white pr-1 z-20">
                                    {`${hour.toString().padStart(2, '0')}:00`}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
        
                {/* Layer 2: Events Grid (Foreground) */}
                <div 
                    className="absolute inset-0 grid w-full" 
                    style={{ gridTemplateRows: `repeat(${totalGridRows}, ${ROW_HEIGHT_REM}rem)` }}
                >
                    {validEvents.map((event) => {
                        // --- THE MATH ---
                        const [startH, startM] = event.startTime.split(':').map(Number);
                        
                        // Row Index (1-based)
                        const startRow = startH - CALENDAR_START_HOUR + 1;
                        
                        // Top Offset (Minutes -> REMs)
                        const topOffsetRem = (startM / 60) * ROW_HEIGHT_REM;
                        
                        // Height (Duration -> REMs)
                        const heightRem = event.duration * ROW_HEIGHT_REM;

                        return (
                            <div
                                key={event.id}
                                className="relative px-1"
                                style={{
                                    gridRowStart: startRow,
                                    marginTop: `${topOffsetRem}rem`,
                                    height: `${heightRem}rem`,
                                    alignSelf: 'start', // Allows div to bleed downwards across rows
                                    zIndex: 10,         // Ensure events sit above grid lines
                                    pointerEvents: 'none' // Wrapper ignores clicks
                                }}
                            >
                                {/* Card Component (Re-enables clicks) */}
                                <div className="h-full pointer-events-auto">
                                    <EventCard event={event} showHourLabels={false}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
            </div>
        </div>    
    );
}



/**
 * 
 * 
 * import React from "react";
import { IEvent, IEventComplex } from "@/app/lib/types";
import { EventCard } from "@/app/components/EventCard"; // <-- UPDATED PATH
import { formatDate } from '@/app/lib/dateUtils';
import { getCalendarHourSlots, CALENDAR_START_HOUR, CALENDAR_END_HOUR } from '@/app/lib/timeUtils';

/**
 * Renders a single day's column in the weekly calendar.
 *

// Get the hour slots we want to display
const hourSlots = getCalendarHourSlots();
// Calculate the total number of 1-hour rows we need
const totalGridRows = CALENDAR_END_HOUR - CALENDAR_START_HOUR;


interface DayColumnProps {
    day: Date;
    events: IEventComplex[];
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
          {/* --- Day Header --- *}
          <div className="text-center py-3 border-b sticky top-0 bg-white z-10">
            <p className="text-sm font-medium text-gray-500">{dayName}</p>
            <p className="text-2xl font-semibold text-blue-600">{dayOfMonth}</p>
          </div>
    
          {/* --- Time Grid Container ---
            This 'relative' container holds two layers:
            1. The background grid with hour lines.
            2. The foreground grid where events are placed.
          *}
          <div className="flex-grow relative">
            
            {/* Layer 1: Background Grid (Hour Labels & Lines) *}
            <div 
              className="grid"
              // Create N rows, each 4rem (64px) high
              style={{ gridTemplateRows: `repeat(${totalGridRows}, 5rem)` }}
            >
              {hourSlots.map((hour) => (
                <div key={hour} className="relative h-20 border-b border-gray-200">
                  {/* Hour Label *}
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
            *}
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
        </div>*
    );
}


 */