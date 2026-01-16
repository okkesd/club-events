/**
 * Represents a single club event.
 */
export interface IEvent {
  id: string;
  clubName: string;    // Display name
  
  // --- Core Info ---
  title: string;
  description: string; // Rich text or long string
  
  // --- Time ---
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM (24h)
  endTime: string;     // HH:MM (24h)

  // --- Location ---
  location: string;    // Room number, Building, or Address

  // --- New Logic Fields ---
  locationType: 'on-campus' | 'off-campus'; // Determines if "Get Directions" is shown
  isRegistrationOpen: boolean;              // Master toggle for the Register button
  
  // --- New Additions ---
  coverImage?: string;       // URL for a poster/hero image
  registrationLink?: string; // Link to Google Forms/Luma/Eventbrite
  capacity?: number;         // e.g. 50 spots (Show "Limited Space" badge)
  tags?: string[];           // e.g. ["Free Food", "Open to All"]
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