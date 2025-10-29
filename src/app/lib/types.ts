/**
 * Represents a single club event.
 */
export interface IEvent {
  id: string;
  title: string;
  clubName: string;
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
  email: string;
  clubName: string;
  role: 'admin' | 'club_member'; // Define the roles
}