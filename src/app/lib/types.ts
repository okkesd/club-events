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

  // Instagram handle used to auto-match scraped events to this club (admin-editable)
  igUsername?: string | null;
}

// For updating a club profile
export interface IClubUpdate {
  clubName?: string;
  email?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  igUsername?: string | null; // admin only — 403 when a club edits itself
}

/**
 * --- EVENTS ---
 */
export interface IEvent {
  sourcePostUrl?: string | null;
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
  hasLiked?: boolean; // Server-side IP-based dedup
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
  sourcePostUrl?: string | null;
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
  category?: AnnouncementCategory | AnnouncementCategory[];
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
export interface ISubscriptionClub {
  clubId: string;
  clubName: string;
  isActive: boolean;
}

export interface ISubscriptionCategory {
  category: AnnouncementCategory;
  isActive: boolean;
}

export interface ISubscription {
  id: string;
  email: string;
  clubs: ISubscriptionClub[];
  categories: ISubscriptionCategory[];
  isActive: boolean;
  createdAt: string;
}

export interface ISubscribeRequest {
  email: string;
  clubIds?: string[];
  categories?: AnnouncementCategory[];
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
  sort_order?: "asc" | "desc";
}

/**
 * --- SCRAPED EVENTS (admin approval inbox) ---
 *
 * Candidate events extracted from clubs' Instagram posts. They live in a staging
 * table and only become real Events once an admin approves them.
 */
export type ScrapedEventStatus = 'pending' | 'approved' | 'rejected';

// The extractor classifies each post; a candidate publishes as an Event or an
// Announcement depending on this. Admins can flip it before approving.
export type ScrapedEventKind = 'event' | 'announcement';

export interface IScrapedEvent {
  id: string;
  source: string;
  sourceEventId: string;
  kind: ScrapedEventKind;

  // Source post
  clubUsername: string;
  postShortcode: string;
  postUrl: string;
  postCaption?: string | null;
  postImageUrl?: string | null;
  postedAt: string;

  // Extracted content (all editable, all nullable)
  title?: string | null;
  description?: string | null;
  confidence: number;        // 0..1

  // Event-only — null on announcement candidates
  date?: string | null;      // ISO datetime
  location?: string | null;

  // Announcement-only — null on event candidates
  category?: AnnouncementCategory | null;
  link?: string | null;
  expiresAt?: string | null; // "YYYY-MM-DD"

  // Review state
  status: ScrapedEventStatus;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  clubId?: string | null;    // null when the IG handle isn't linked to a club
  clubName?: string | null;
  clubIsRemembered: boolean; // club came from a stored handle->publisher mapping, not a fresh match
  createdEventId?: string | null;
  createdAnnouncementId?: string | null;
  createdAt: string;
}

export interface IScrapedEventFilters {
  status?: ScrapedEventStatus | 'all';
  kind?: ScrapedEventKind | 'all';
  clubId?: string;
  page?: number;
  pageSize?: number;
}

// PATCH /admin/scraped-events/{id} — fix the extraction before approving,
// including reclassifying a misjudged candidate via `kind`.
export interface IScrapedEventUpdate {
  kind?: ScrapedEventKind;
  title?: string;
  date?: string;
  location?: string;
  description?: string;
  clubId?: string;
  category?: AnnouncementCategory;
  link?: string;
  expiresAt?: string;
}

// POST /admin/scraped-events/{id}/approve — all optional overrides
export interface IScrapedEventApprove {
  clubId?: string;
  publishAsAdmin?: boolean;  // publish under the admin account; clubId is ignored when true
  title?: string;
  description?: string;
  date?: string;            // "YYYY-MM-DD"
  startTime?: string;       // "HH:MM"
  endTime?: string;         // "HH:MM"
  duration?: number;
  locationType?: 'on-campus' | 'off-campus';
  location?: string;
  coverImage?: string;
  tags?: string[];
  isRegistrationOpen?: boolean;
  registrationLink?: string | null;
  capacity?: number | null;
}

// POST /admin/scraped-events/{id}/approve-announcement — all optional overrides.
// title and body are required by the backend; the panel enforces them first.
export interface IScrapedAnnouncementApprove {
  clubId?: string;
  publishAsAdmin?: boolean;  // publish under the admin account; clubId is ignored when true
  title?: string;
  body?: string;
  category?: AnnouncementCategory;
  link?: string;
  coverImage?: string;
  tags?: string[];
  isPinned?: boolean;
  expiresAt?: string;        // "YYYY-MM-DD"
}

export interface IScrapedImportResult {
  imported: number;
  skipped: number;
  matchedClubs: number;
}

// Admin's routing decision: which account a scraped Instagram handle publishes under.
// Distinct from a club's own ClubData.igUsername — the mapping wins.
export interface IIgClubMapping {
  clubUsername: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  updatedAt: string;
}
