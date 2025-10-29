import React from "react";
import EventCalendar from "@/app/main/components/EventCalendar";

/**
 * This is the main page component for the /main route.
 * It's a Server Component by default in the Next.js App Router.
 * Its only job is to import and render the main client component
 * that holds all the state and logic for the calendar.
 */
export default function MainCalendarPage() {
    return <EventCalendar />;
}