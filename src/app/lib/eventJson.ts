export interface ImportedEventFields {
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  timeMode?: 'duration' | 'endTime';
}

/** Import editable details only; never take ownership or publishing state from JSON. */
export function parseEventJson(input: string): ImportedEventFields {
  const text = input.trim().replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i, '$1');
  const raw: unknown = JSON.parse(text);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid event JSON');
  const data = raw as Record<string, unknown>;
  if (data.kind !== undefined && data.kind !== 'event') throw new Error('Invalid event kind');

  const fields: ImportedEventFields = {};
  for (const key of ['title', 'description', 'location'] as const) {
    if (data[key] == null) continue;
    if (typeof data[key] !== 'string') throw new Error(`Invalid ${key}`);
    if (data[key].trim()) fields[key] = data[key].trim();
  }

  if (data.date != null && data.date !== '') {
    if (typeof data.date !== 'string') throw new Error('Invalid date');
    const match = data.date.trim().match(/^(\d{4}-\d{2}-\d{2})(?:T((?:[01]\d|2[0-3]):[0-5]\d)(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/);
    if (!match) throw new Error('Invalid date');
    const parsed = new Date(`${match[1]}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== match[1]) throw new Error('Invalid date');
    // Keep the supplied wall-clock time, without browser timezone conversion.
    fields.date = match[1];
    if (match[2]) fields.startTime = match[2];
  }

  for (const key of ['startTime', 'endTime'] as const) {
    if (data[key] == null || data[key] === '') continue;
    if (typeof data[key] !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(data[key])) throw new Error(`Invalid ${key}`);
    fields[key] = data[key].slice(0, 5);
  }
  if (data.duration != null) {
    if (typeof data.duration !== 'number' || !Number.isFinite(data.duration) || data.duration <= 0 || data.duration > 24) throw new Error('Invalid duration');
    fields.duration = data.duration;
    fields.timeMode = 'duration';
  }
  if (fields.endTime) fields.timeMode = 'endTime';
  else if (fields.startTime) fields.timeMode = 'duration';
  if (!Object.keys(fields).length) throw new Error('No event details');
  return fields;
}
