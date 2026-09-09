// Announcement deadlines are calendar dates, valid through the whole day in
// the campus timezone. Date-only strings must not be treated as UTC midnight.
export function announcementDeadline(expiresAt?: string | null): number {
  if (!expiresAt) return Infinity;
  if (/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    return Date.parse(`${expiresAt}T00:00:00+03:00`) + 24 * 60 * 60 * 1000;
  }
  return Date.parse(expiresAt);
}

export function isAnnouncementExpired(expiresAt?: string | null, now = Date.now()): boolean {
  return announcementDeadline(expiresAt) <= now;
}

export function isAnnouncementExpiringSoon(expiresAt?: string | null, now = Date.now()): boolean {
  const remaining = announcementDeadline(expiresAt) - now;
  return remaining > 0 && remaining < 3 * 24 * 60 * 60 * 1000;
}
