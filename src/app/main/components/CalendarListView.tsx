import React from "react";
import { IEvent } from "@/app/lib/types";
import { ListViewDay } from "./ListViewDay";
import CalendarHighlights from './CalendarHighlights';

interface CalendarListViewProps {
    weekDays: Date[];
    getEventsForDay: (day: Date) => IEvent[];
}

export function CalendarListView({ weekDays, getEventsForDay }: CalendarListViewProps) {
    return (
        <div className="grid items-start gap-8 p-4 max-w-2xl lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_18rem] mx-auto w-full">
          <div className="flex min-w-0 flex-col gap-6">
            {weekDays.map((day) => (
                <ListViewDay
                    key={day.toISOString()}
                    day={day}
                    events={getEventsForDay(day)}
                />
            ))}
          </div>
          <CalendarHighlights />
        </div>
    );
}
