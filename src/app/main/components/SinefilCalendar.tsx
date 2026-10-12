"use client";

import EventCalendar from './EventCalendar';

export default function SinefilCalendar({ week }: { week: string }) {
  return <EventCalendar week={week} cinema />;
}
