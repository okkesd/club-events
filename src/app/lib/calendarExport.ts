import type { IEvent } from './types';

const eventTimeZone = 'Europe/Istanbul';
const zonedFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: eventTimeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

function eventTimestamp(date: string, time: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time)) {
    throw new Error('Invalid event date or time');
  }
  const wallTime = Date.parse(`${date}T${time.length === 5 ? `${time}:00` : time}Z`);
  if (!Number.isFinite(wallTime) || new Date(wallTime).toISOString().slice(0, 10) !== date) {
    throw new Error('Invalid event date');
  }
  let instant = wallTime;
  // Resolve Istanbul's offset for this date using the runtime timezone database.
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(zonedFormatter.formatToParts(instant).map(part => [part.type, part.value]));
    const represented = Date.parse(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`);
    const correction = wallTime - represented;
    instant += correction;
    if (correction === 0) return instant;
  }
  throw new Error('Could not resolve event timezone');
}

const timestamp = (value: number) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const escapeText = (text: string) => text.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');

// RFC 5545 folds at 75 UTF-8 bytes, without splitting a Unicode character.
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let result = '', length = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (length + size > 75) { result += '\r\n '; length = 1; }
    result += character;
    length += size;
  }
  return result;
}

export function createEventCalendar(event: IEvent, origin: string, now = new Date()): string {
  const start = eventTimestamp(event.date, event.startTime);
  let end: number;
  if (event.endTime) {
    end = eventTimestamp(event.date, event.endTime);
    if (end < start) {
      const nextDay = new Date(`${event.date}T00:00:00Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      end = eventTimestamp(nextDay.toISOString().slice(0, 10), event.endTime);
    }
  } else {
    end = start + event.duration * 60 * 60 * 1000;
  }
  if (!Number.isFinite(end) || end <= start) throw new Error('Invalid event end time');
  const eventUrl = new URL(`/event/${encodeURIComponent(event.id)}`, origin);
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//evenements//Events//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${encodeURIComponent(event.id)}@${eventUrl.host}`,
    `DTSTAMP:${timestamp(now.getTime())}`,
    `DTSTART:${timestamp(start)}`, `DTEND:${timestamp(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(`${event.description}\n\n${eventUrl.href}`)}`,
    `LOCATION:${escapeText(event.location)}`,
    `URL:${eventUrl.href}`, 'END:VEVENT', 'END:VCALENDAR',
  ].map(foldLine).join('\r\n') + '\r\n';
}

export function downloadEventCalendar(event: IEvent): void {
  const content = createEventCalendar(event, window.location.origin);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `event-${event.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`;
  document.body.appendChild(link);
  try { link.click(); } finally {
    link.remove();
    // Allow the browser to consume the download before releasing the blob.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
