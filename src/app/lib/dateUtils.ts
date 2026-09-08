/**
 * Calculates the start of the week (Monday) for a given date.
 * Sets the time to 00:00:00 (midnight) to ensure consistency.
 * * @param date - The date to find the week start for.
 * @returns A new Date object set to midnight on the Monday of that week.
 */
export const getWeekStartDate = (date: Date): Date => {
  // Create a new Date object to avoid mutating the original
  const newDate = new Date(date.getTime());
  
  // getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const dayOfWeek = newDate.getDay();
  
  // Calculate the difference to get to Monday.
  // (dayOfWeek + 6) % 7 gives:
  // Sunday (0) -> 6 days to subtract
  // Monday (1) -> 0 days to subtract
  // Tuesday (2) -> 1 day to subtract
  // ...
  const diff = (dayOfWeek + 6) % 7;
  
  // Set the date to Monday
  newDate.setDate(newDate.getDate() - diff);
  
  // Set time to midnight for a clean "start of day"
  newDate.setHours(0, 0, 0, 0);
  
  return newDate;
};

/**
 * Gets an array of 7 Date objects representing the week (Mon-Sun)
 * for a given date.
 * * @param date - Any date within the desired week.
 * @returns An array of 7 Date objects, starting with Monday.
 */
export const getWeekDays = (date: Date): Date[] => {
  const startDate = getWeekStartDate(date);
  const days: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate.getTime());
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  
  return days;
};

/**
 * Formats a date into a short, readable string (e.g., "Oct 27").
 * * @param date - The Date object to format.
 * @returns A string like "MMM DD" (e.g., "Oct 27").
 */
export const formatDate = (date: Date, locale = "en-US"): string => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats the header string for the week.
 * e.g., "October 27 - November 2, 2025"
 */
export const formatWeekHeader = (weekDays: Date[], compact = false, locale = "en-US"): string => {
    if (weekDays.length < 7) return "";
    const label = new Intl.DateTimeFormat(locale, {
        month: compact ? "short" : "long",
        day: "numeric",
        year: "numeric",
    }).formatRange(weekDays[0], weekDays[6]).replace(/[\u00a0\u2009\u202f]/g, " ");
    // Normalize ICU whitespace differences between Node and browsers.
    return compact ? label.replace(/\s*–\s*/g, "–") : label;
};

/**
 * Formats a Date object into a time string, e.g., "14:00"
 */
export const formatTime = (date: Date, locale = "en-US"): string => {
    return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};
