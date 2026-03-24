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
  likes: number;
  viewCount: number;
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
  email: string;
  clubName: string;
  role: 'admin' | 'club';
  isVerified: boolean;
  avatarUrl?: string; // Helper for UI (usually mapped from logoUrl)
}

export interface SignUpData {
  clubName: string;
  email: string;
  password: string;
}

/**
 * --- ANNOUNCEMENTS ---
 */
export type AnnouncementCategory =
  | 'internship' | 'job' | 'scholarship' | 'competition'
  | 'recruitment' | 'academic' | 'workshop' | 'general';

export interface IAnnouncement {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  body: string;
  coverImage?: string;
  link?: string;
  tags: string[];
  category: AnnouncementCategory;
  isPinned: boolean;
  expiresAt?: string;   // "YYYY-MM-DD"
  createdAt: string;     // ISO datetime
  updatedAt: string;     // ISO datetime
}

export interface IAnnouncementCreate {
  clubId: string;
  title: string;
  body: string;
  coverImage?: string;
  link?: string;
  tags?: string[];
  category?: AnnouncementCategory;
  expiresAt?: string;
}

export interface IAnnouncementUpdate {
  title?: string;
  body?: string;
  coverImage?: string;
  link?: string;
  tags?: string[];
  category?: AnnouncementCategory;
  expiresAt?: string | null;
}

export interface IAnnouncementFilters {
  category?: AnnouncementCategory;
  club_id?: string;
  tag?: string;
  search?: string;
  include_expired?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * --- PAGINATION ---
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

/**
 * --- SUBSCRIPTIONS ---
 */
export interface ISubscription {
  id: string;
  email: string;
  clubId?: string;
  category?: AnnouncementCategory;
  isActive: boolean;
  createdAt: string;
}

export interface ISubscribeRequest {
  email: string;
  clubId?: string;
  category?: AnnouncementCategory;
}

/**
 * --- EVENTS BROWSE ---
 */
export interface IEventFilters {
  search?: string;
  club_id?: string;
  tag?: string;
  location_type?: 'on-campus' | 'off-campus';
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
}