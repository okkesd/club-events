/**
 * Represents a single club event.
 */
export interface IEvent {
  id: string;
  title: string;
  clubID: number;    // Display name
  
  description: string; // Rich text or long string
  
  // --- Time ---
  //date: string;        // YYYY-MM-DD
  startDate: string,
  startTime: string;   // HH:MM (24h)
  endTime: string;     // HH:MM (24h)
  duration: number;

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


export interface IEventComplex {
  id: string;
  title: string;
  clubID: string;    // Display name
  clubName: string;
  
  description: string; // Rich text or long string
  
  // --- Time ---
  //date: string;        // YYYY-MM-DD
  startDate: string,
  startTime: string;   // HH:MM (24h)
  endTime: string;     // HH:MM (24h)
  duration: number;

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

export interface SocialLinks {
  instagram?: string;
  website?: string;
  linkedin?: string;
}

export interface Club {
  id: string;
  clubName: string;
  clubMail: string;
  
  // --- New Fields ---
  category: string;        // e.g. "Technology", "Sports"
  description: string;     // Full bio/story
  logo: string;            // Square logo URL
  banner: string;          // Wide hero image URL
  foundedYear?: number;
  socials?: SocialLinks;
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