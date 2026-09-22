// Fallback start for weeks without events.
export const CALENDAR_START_HOUR = 8;

export function getCalendarStartHour(events: { startTime: string }[]): number {
  const hours = events.map(event => Number(event.startTime.split(":")[0]))
    .filter(hour => Number.isFinite(hour) && hour >= 0 && hour < 24);
  if (hours.length === 0) return CALENDAR_START_HOUR;
  // Keep whole-hour rows, at least an hour of lead-in, and start by 13:00.
  return Math.max(0, Math.min(13, Math.floor(Math.min(...hours))));
}

// Default end of the grid; late events can extend it up to 21:00.
export const CALENDAR_END_HOUR = 18;
export const CALENDAR_MAX_END_HOUR = 21;

/**
 * Generates an array of hours for the time column.
 * e.g., [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
 */
export const getCalendarHourSlots = (endHour = CALENDAR_END_HOUR, startHour = CALENDAR_START_HOUR) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(hour);
  }
  return slots;
};

export function calculateEndTime(startTime: string, duration:number) {
  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h * 60 + m + duration * 60;

  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;

  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}
