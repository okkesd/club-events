// The hour your calendar grid starts (e.g., 9 AM)
export const CALENDAR_START_HOUR = 9;

// The hour your calendar grid ends (e.g., 8 PM)
// Note: We use 20 (8 PM) as the end, meaning the last slot is 19:00 - 20:00.
export const CALENDAR_END_HOUR = 19;

/**
 * Generates an array of hours for the time column.
 * e.g., [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
 */
export const getCalendarHourSlots = () => {
  const slots = [];
  for (let hour = CALENDAR_START_HOUR; hour < CALENDAR_END_HOUR; hour++) {
    slots.push(hour);
  }
  return slots;
};