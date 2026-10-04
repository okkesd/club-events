import { getWeekStartDate } from './dateUtils';

export function calendarDateString(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Parse date-only values locally so browser timezone offsets cannot change the day.
export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && calendarDateString(date) === value ? date : null;
}

export function calendarWeek(value: string): string | null {
  const date = parseCalendarDate(value);
  return date ? calendarDateString(getWeekStartDate(date)) : null;
}

export function currentCalendarWeek(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)!.value;
  return calendarWeek(`${part('year')}-${part('month')}-${part('day')}`)!;
}
