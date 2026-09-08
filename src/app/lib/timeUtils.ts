// The hour your calendar grid starts (e.g., 9 AM)
export const CALENDAR_START_HOUR = 8;

// Default end of the grid; late events can extend it up to 21:00.
export const CALENDAR_END_HOUR = 18;
export const CALENDAR_MAX_END_HOUR = 21;

/**
 * Generates an array of hours for the time column.
 * e.g., [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
 */
export const getCalendarHourSlots = (endHour = CALENDAR_END_HOUR) => {
  const slots = [];
  for (let hour = CALENDAR_START_HOUR; hour < endHour; hour++) {
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
