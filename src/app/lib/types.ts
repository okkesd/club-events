/**
 * Represents a single club event.
 */
export interface IEvent {
  id: string;
  title: string;
  clubName: string;
  clubSlug: string;
  startTime: string; // e.g., "10:00"
  endTime: string;   // e.g., "11:00"
  date: string;      // e.g., "2025-10-27"
  
  // --- Updated Fields ---
  description: string;
  location: string;
}

/**
 * Represents the API response for a week's worth of events,
 * grouped by date (YYYY-MM-DD string).
 */
export interface IWeekEventsResponse {
  [date: string]: IEvent[];
}

export interface IUser {
  id: string;
  username: string
  email: string;
  clubName: string;
  clubSlug: string | null
  role: 'admin' | 'club_member'; // Define the roles
}

export type CreateEventData = Omit<IEvent, 'id'>;

/**
 * Represents a single university club.
 */
export interface IClub {
  id: string;
  name: string;        // e.g., "Coding Club"
  slug: string;        // e.g., "coding-club"
  logoUrl: string;     // URL to a logo
  leaderName: string;
  contactEmail: string;
  purpose: string;     // A short bio
}

/**
 * The combined data object for a single club's page.
 */
export interface IClubPageData {
  club: IClub;
  events: IEvent[]; // All events for this club
}

/**
 * The data payload for UPDATING an event.
 * Club name cannot be changed from the form.
 */
export type UpdateEventData = Omit<IEvent, 'id' | 'clubName' | 'clubSlug'>;