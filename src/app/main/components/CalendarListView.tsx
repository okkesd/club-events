import React from "react";
import { IEvent } from "@/app/lib/types";
import { ListViewDay } from "./ListViewDay";

interface CalendarListViewProps {
    weekDays: Date[];
    getEventsForDay: (day: Date) => IEvent[];
}

export function CalendarListView({ weekDays, getEventsForDay }: CalendarListViewProps) {
    return (
        <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto w-full">
            {weekDays.map((day) => (
                <ListViewDay
                    key={day.toISOString()}
                    day={day}
                    events={getEventsForDay(day)}
                />
            ))}
        </div>
    );
}
