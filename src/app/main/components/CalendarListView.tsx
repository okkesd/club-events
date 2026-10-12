import React from "react";
import { IEvent } from "@/app/lib/types";
import { ListViewDay } from "./ListViewDay";
import { groupFilmsForDay } from '@/app/lib/cinema';
import CalendarHighlights from './CalendarHighlights';

interface CalendarListViewProps {
    cinema?: boolean;
    weekDays: Date[];
    getEventsForDay: (day: Date) => IEvent[];
}

export function CalendarListView({ weekDays, getEventsForDay, cinema = false }: CalendarListViewProps) {
    return (
        <div className={`grid items-start gap-8 p-4 max-w-2xl mx-auto w-full ${cinema ? '' : 'lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_18rem]'}`}>
          <div className="flex min-w-0 flex-col gap-6">
            {weekDays.map((day) => (
                <ListViewDay
                    key={day.toISOString()}
                    day={day}
                    events={cinema ? groupFilmsForDay(getEventsForDay(day)) : getEventsForDay(day)}
                />
            ))}
          </div>
          {!cinema && <CalendarHighlights />}
        </div>
    );
}
