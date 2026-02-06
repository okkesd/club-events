/**
 * Generic API Response wrapper
 */
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  errorMsg?: string; // Mapped from error_msg
}

/**
 * --- CLUBS ---
 */
export interface ClubData {
  id: string;
  slug: string;
  email: string;
  clubName: string;
  description?: string;
  
  // Visuals
  logoUrl?: string;
  bannerUrl?: string;
  
  // Status
  role: 'admin' | 'club';
  isVerified: boolean;
  rejectionReason?: string;
}

// For updating a club profile
export interface IClubUpdate {
  clubName?: string;
  email?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

/**
 * --- EVENTS ---
 */
export interface IEvent {
  id: string;
  clubId: string;
  clubName: string; // Flattened for display
  
  title: string;
  description: string;
  
  // Time
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  duration: number;   // e.g. 1.5
  
  // Location
  locationType: 'on-campus' | 'off-campus';
  location: string;
  
  // Visuals & Meta
  coverImage?: string;
  tags?: string[];
  
  // Registration
  isRegistrationOpen: boolean;
  registrationLink?: string;
  capacity?: number;
}

// For creating/updating an event (everything optional for update)
export interface IEventUpdate {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  locationType?: 'on-campus' | 'off-campus';
  location?: string;
  coverImage?: string;
  isRegistrationOpen?: boolean;
  registrationLink?: string;
  capacity?: number;
}

/**
 * --- USERS (Auth) ---
 */
export interface IUser {
  id: string;
  username: string
  email: string;
  clubName: string;
  role: 'admin' | 'club';
  isVerified: boolean;
  avatarUrl?: string; // Helper for UI (usually mapped from logoUrl)
}
