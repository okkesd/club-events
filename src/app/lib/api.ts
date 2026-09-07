import { IEvent, ClubData, IApiResponse, IClubUpdate, IEventUpdate, SignUpData, IAnnouncement, IAnnouncementCreate, IAnnouncementUpdate, IAnnouncementFilters, PaginatedResponse, IEventFilters, ISubscribeRequest, ISubscription, IIgClubMapping, IScrapedEvent, IScrapedEventFilters, IScrapedEventUpdate, IScrapedEventApprove, IScrapedAnnouncementApprove, IScrapedImportResult } from './types';
import { getWeekStartDate } from './dateUtils';

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4444";
const PROXY_URL = process.env.PROXY_URL || "/api/proxy";

/**
 * Custom error class for API errors with status code and structured details.
 */
export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Handles non-OK responses by throwing an ApiError with appropriate message.
 * - 422: Validation error — extracts field-level detail from FastAPI format
 * - 429: Rate limit — user-friendly message
 * - Other: Generic fallback
 */
async function handleApiError(res: Response): Promise<never> {
  let body: any = {};
  try { body = await res.json(); } catch {}

  // Handling expired sessions
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      // 1. Clear any stored tokens/auth state (adjust the key to match your app)
      localStorage.removeItem("token"); 
      
      // 2. Force navigation to the login or main page
      window.location.href = "/login";
    }
    
    // 3. Still throw an error to halt the current function's execution 
    // while the browser handles the navigation
    throw new ApiError("Session expired. Redirecting to login...", 401);
  }

  if (res.status === 422) {
    // FastAPI validation: { detail: [{ loc: [...], msg: "...", type: "..." }] }
    const detail = body.detail;
    if (Array.isArray(detail)) {
      const messages = detail.map((d: any) => {
        const field = d.loc?.slice(-1)[0] || "field";
        return `${field}: ${d.msg}`;
      });
      throw new ApiError(messages.join("; "), 422, detail);
    }
    throw new ApiError(typeof detail === "string" ? detail : "Validation error", 422, detail);
  }

  if (res.status === 429) {
    throw new ApiError("Too many requests. Please wait a moment and try again.", 429);
  }

  const message = body.detail || body.message || `Request failed (${res.status})`;
  throw new ApiError(message, res.status, body);
}

/**
 * Resolves an image URL that may be either an absolute Supabase URL
 * or a relative backend path (e.g. "/static/abc123.jpg").
 * Returns the URL as-is if absolute, or prepends the backend URL if relative.
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${URL}${url}`;
}

const formatDateToLocalISO = (date: Date): string => {
  const year = date.getFullYear();
  // Month is 0-indexed in JS, so we add 1
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Backend may return snake_case fields (e.g. has_liked, view_count) that
// the frontend IEvent interface expects in camelCase. Normalize them here.
function normalizeEvent(raw: any): IEvent {
  if (!raw) return raw;
  return {
    ...raw,
    hasLiked: raw.hasLiked ?? raw.has_liked ?? false,
    viewCount: raw.viewCount ?? raw.view_count ?? 0,
  };
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // We are in the Browser -> Relative URL is fine
    return "";
  }
  // We are on the Server -> Need absolute URL
  // Use a widely available env var or default to localhost:3000
  return process.env.NEXTJS_APP_URL || "http://localhost:3000";
};

/**
 * Simulates an API call to fetch all events for a given week.
 * @param weekStartDate - The Date object for the Monday of the week.
 */
export const fetchEventsForWeek = async (currentDate: Date): Promise<IEvent[]|null> => {
  console.log(`Fetching events for the week`);
  const date_str = formatDateToLocalISO(currentDate)
  let BASE_URL = getBaseUrl()
  let functionURL = `${BASE_URL}/api/proxy/events/weekly?date=${date_str}`;
  //let functionURL = URL + `events/weekly?date=${date_str}`
  
  let data;
  try {
    const response = await fetch(functionURL, {
      method:"GET", 
      //body: JSON.stringify({"day": day, "month": month, "year": year}),
      headers: {"Content-Type": "application/json"},
      next: { revalidate: 60 }
    })
    if (response.ok){
      let raw_data = await response.json()
      data = (raw_data["data"] as any[])?.map(normalizeEvent) ?? [];
      console.log(data)
      console.log(typeof(data))
      return data;

    } else {
      throw new Error("Failed to fetch")
    }
  } catch (error) {
    console.error("error", error)
    return null
  }
};


/**
 * * NEW FUNCTION *
 * Simulates an API call to fetch a single event by its ID.
 * @param eventId - The unique ID of the event.
 */
// Accepts an optional visitorId (UUID cookie) for like/view deduplication
export const fetchEventById = async (eventId: string, visitorId?: string): Promise<IEvent | null> => {
  if (!eventId) return null;

  const BASE_URL = getBaseUrl();
  let functionURL = `${BASE_URL}/api/proxy/events/${eventId}`;

  const fetchHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Forward the visitor UUID so the proxy can pass it to the backend
  if (visitorId) {
    fetchHeaders["x-visitor-id"] = visitorId;
  }

  try {
    const response = await fetch(functionURL, {
      method: "GET",
      headers: fetchHeaders, // <-- Attach the headers here
      cache: "no-store"      // Ensuring we don't cache user-specific state
    });

    if (response.ok){
      const raw_data = await response.json()
      return normalizeEvent(raw_data["data"]);
    } else {
      if (response.status === 404) console.warn(`Event ${eventId} not found`);
      throw new Error(`Failed to get event ${eventId}`);
    }
  } catch (error) {
    console.error("error ", error)
    return null
  }
};

export const fetchClubById = async (clubId: string): Promise<ClubData | null> => {
  console.log(`Fetching club wiht id ${clubId}`)

  //let functionURL = URL + "/clubs/" + clubId
  const BASE_URL = getBaseUrl()

  let proxyUrl = BASE_URL + "/api/proxy/clubs/" + clubId

  let data
  try {
    const response = await fetch(proxyUrl, {"cache": "no-store"})
    if (response.ok){
      const raw_data = await response.json()
      data = raw_data["data"]
      console.log(data)
      return data
    } else {
      throw new Error(`Failed to fetch club, id ${clubId}`)
    }
  } catch (error){
    console.error(error)
    return null
  }
}

export const fetchEventsByClubId = async (clubId: string, visitorId?: string) :Promise<IEvent[]|null> => {
  console.log(`Fetching events by club id ${clubId}`)
  const BASE_URL = getBaseUrl();
  let functionURL = `${BASE_URL}/api/proxy/clubs/` + clubId + "/events"

  const fetchHeaders: HeadersInit = {};
  if (visitorId) {
    fetchHeaders["x-visitor-id"] = visitorId;
  }

  try {
    const response = await fetch(functionURL, { cache: "no-store", headers: fetchHeaders })
    if (response.ok){
      const raw_data = await response.json()
      return (raw_data.data as any[])?.map(normalizeEvent) ?? [];
    } else {
      throw new Error(`Failed to fetch events by club, club id: ${clubId}`)
    }
  } catch (error){
    console.log(error)
    return null
  }
}

export const uploadImage = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  const BASE_URL = getBaseUrl();

  const authHeader = getAuthHeader()

  try {
    const response = await fetch(`${BASE_URL}/api/proxy/upload`, {
      method: "POST",
      headers: authHeader,
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      return json.url; // Returns absolute Supabase URL or legacy relative path
    } else {
      console.error("Upload failed");
      return null;
    }
  } catch (error) {
    console.error("Network error during upload:", error);
    return null;
  }
};

export async function createEvent(eventData: any): Promise<IApiResponse<IEvent>> {
  const BASE_URL = getBaseUrl();
  const headers = getAuthHeader()

    const response = await fetch(`${BASE_URL}/api/proxy/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers
        },
        body: JSON.stringify(eventData),
    });

    if (!response.ok) await handleApiError(response);

    return response.json();
}

export async function getAllClubs(): Promise<ClubData[] | null> {

  const BASE_URL = getBaseUrl()

  try {
    const response = await fetch(`${BASE_URL}/api/proxy/all_clubs`, {"cache": "no-cache"})
  
    if (response.ok) {
      const raw_data = await response.json()
      return raw_data.data
    } else {
      throw new Error(`Failed to fetch all clubs`)
    }
  }
  catch (error) {
    console.error(error)
    return null
  }
}
/*
test_club@gmail.com
test_club

verified_club@gmail.com
verified_club
*/

export async function updateClub(clubId: string, updateData: IClubUpdate): Promise<IApiResponse<ClubData>> {

    const BASE_URL = getBaseUrl()

    const headers = getAuthHeader()

    const response = await fetch(`${BASE_URL}/api/proxy/clubs/${clubId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...headers
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) await handleApiError(response);

    return response.json();
}


// 1. Fetch all clubs for admin
export async function getAdminClubs(status?: 'verified' | 'pending'): Promise<ClubData[]> {
    // Build URL with query param if status exists
    const query = status ? `?status=${status}` : '';
    let BASE_URL = getBaseUrl()
    const headers = getAuthHeader()

    const res = await fetch(`${BASE_URL}/api/proxy/admin/clubs${query}`, {
        headers: headers,
        cache: 'no-store'
      });
    
    if (!res.ok) throw new Error("Failed to fetch clubs");
    const resolvedData = await res.json()
    const dataToReturn = resolvedData["data"]
    return dataToReturn;
}

// 2. Verify or Reject a club
export async function setClubVerification(clubId: string, isVerified: boolean, reason?: string) {
  const BASE_URL = getBaseUrl();
  const headers = getAuthHeader()

    const res = await fetch(`${BASE_URL}/api/proxy/admin/clubs/${clubId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...headers
        },
        body: JSON.stringify({ 
            is_verified: isVerified,
            rejection_reason: reason 
        }),
    });

    if (!res.ok) throw new Error("Failed to update verification status");
    return res.json();
}

// to delete an event by its owner or admin
export async function deleteEvent(eventId: string): Promise<IApiResponse<IEvent>> {
  const BASE_URL = getBaseUrl();
  const headers = getAuthHeader();

  const res = await fetch(`${BASE_URL}/api/proxy/events/${eventId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to delete event");
  }

  return res.json();
}

// to update an event by its owner
export async function updateEvent(eventId: string, data: IEventUpdate): Promise<IApiResponse<IEvent>> {
  const BASE_URL = getBaseUrl();

    const res = await fetch(`${BASE_URL}/api/proxy/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(data),
    });

    if (!res.ok) await handleApiError(res);

    // Returns the standard envelope — the event is under .data, and needs the
    // same snake_case normalization as every other event response.
    const json = await res.json();
    return { ...json, data: json.data ? normalizeEvent(json.data) : json.data };
}

export async function getAllClubsUser(search?: string): Promise<ClubData[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    let BASE_URL = getBaseUrl()


    const res = await fetch(`${BASE_URL}/api/proxy/clubs${query}`, { cache: 'no-store' });
    
    if (!res.ok) throw new Error("Failed to fetch clubs");
    
    const json = await res.json();
    return json.data;
}

export async function toggleEventLike(eventId: string): Promise<{ likes: number; hasLiked: boolean }> {
  const BASE_URL = getBaseUrl()

  const res = await fetch(`${BASE_URL}/api/proxy/event_like/${eventId}`, {
    method: 'POST',
    cache: 'no-store',
  });

  if (!res.ok) throw new Error("Failed to like")

  const json = await res.json()
  const data = json.data;
  return {
    likes: data.likes ?? data.like_count ?? 0,
    hasLiked: data.hasLiked ?? data.has_liked ?? false,
  };
}



// 1. LOGIN FUNCTION
export async function loginUser(email: string, password: string) {

  const BASE_URL = getBaseUrl()

  // OAuth2 expects form-data, not JSON
  const formData = new URLSearchParams();
  formData.append("username", email); // FastAPI maps 'username' to email
  formData.append("password", password);

  const res = await fetch(`${BASE_URL}/api/proxy/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
       // We throw a specific error text that the UI already knows how to display
       throw new Error("Invalid email or password.");
    }

    // 2. Handle System Errors (500, 422, etc.)
    // We try to parse the error detail from Python, fallback to generic message
    let errorMessage = "Login failed";
    try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
    } catch (e) {
        // If response wasn't JSON (e.g. Nginx 502 Bad Gateway HTML), ignore parse error
    }
    
    throw new Error(errorMessage);
  }

  return res.json(); // Returns { access_token, token_type }
}

// Helper to get the token from storage
function getAuthHeader() {
  // Ensure we are in the browser before accessing localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      return { "Authorization": `Bearer ${token}` };
    }
  }
}

// 2. GET CURRENT USER FUNCTION
export async function getCurrentUser() {

  const BASE_URL = getBaseUrl()

  const headers = {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    }

  const res = await fetch(`${BASE_URL}/api/proxy/users/me`, {
    method: "GET",
    headers: headers,
  });

  if (!res.ok) {

    if (res.status == 401) { // return null for 401
      
      console.warn("Session expired or invalid (401). returning guest state.");
      return null; 
    } else { // throw error for other cases

      throw new Error(`Failed to fetch user: ${res.status} ${res.statusText}`);
    } 
  }
  return res.json(); // Returns the User object
}
export async function signUpUser(data: SignUpData) {
  const BASE_URL = getBaseUrl()

  const res = await fetch(`${BASE_URL}/api/proxy/signup`, { // or /signup
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Registration failed");
  }

  // Expecting backend to return { access_token: "...", token_type: "bearer" }
  // OR just { success: true } if you require email verification first.
  return res.json();
}

export async function contactApi(email: string, message: string){

  const BASE_URL = getBaseUrl()

  const res = await fetch(`${BASE_URL}/api/proxy/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({"email": email, "message": message})
  })

  if (!res.ok) await handleApiError(res);

  return res.json()
}

export async function getContacts(){
  const BASE_URL = getBaseUrl()
  const headers = getAuthHeader()

  const res = await fetch(`${BASE_URL}/api/proxy/get_contacts`, {
    method: "GET",
    headers: headers
  })

  if (!res.ok){
    if (res.status === 404) {
      // 404 means no contacts found — return empty data
      return { data: [] };
    }
    const body = await res.json()
    throw new Error(body.detail || "Failed to get contacts")
  }
  return res.json()
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export async function fetchAnnouncements(filters?: IAnnouncementFilters): Promise<PaginatedResponse<IAnnouncement>> {
  const BASE_URL = getBaseUrl();
  const params = new URLSearchParams();

  if (filters?.category) {
    const cats = Array.isArray(filters.category) ? filters.category : [filters.category];
    cats.forEach((c) => params.append("category", c));
  }
  if (filters?.club_id) params.set("club_id", filters.club_id);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.include_expired) params.set("include_expired", "true");
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.pageSize) params.set("page_size", String(filters.pageSize));

  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`${BASE_URL}/api/proxy/announcements${query}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch announcements");

  return res.json();
}

export async function fetchAnnouncementById(id: string): Promise<IAnnouncement | null> {
  const BASE_URL = getBaseUrl();

  try {
    const res = await fetch(`${BASE_URL}/api/proxy/announcements/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function createAnnouncement(data: IAnnouncementCreate): Promise<IApiResponse<IAnnouncement>> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/announcements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
}

export async function updateAnnouncement(id: string, data: IAnnouncementUpdate): Promise<IApiResponse<IAnnouncement>> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/announcements/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
}

export async function deleteAnnouncement(id: string): Promise<IApiResponse<IAnnouncement>> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/announcements/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
}

export async function fetchAnnouncementsByClubId(clubId: string): Promise<IAnnouncement[]> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/announcements?club_id=${clubId}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch club announcements");

  const json = await res.json();
  // Handle both paginated and flat responses
  return json.data;
}

// ============================================
// EVENTS BROWSE (paginated)
// ============================================

export async function fetchEvents(filters?: IEventFilters): Promise<PaginatedResponse<IEvent>> {
  const BASE_URL = getBaseUrl();
  const params = new URLSearchParams();

  if (filters?.search) params.set("search", filters.search);
  if (filters?.club_id) params.set("club_id", filters.club_id);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.location_type) params.set("location_type", filters.location_type);
  if (filters?.date_from) params.set("date_from", filters.date_from);
  if (filters?.date_to) params.set("date_to", filters.date_to);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.sort_order) params.set("sort_order", filters.sort_order);
  if (filters?.pageSize) params.set("page_size", String(filters.pageSize));

  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`${BASE_URL}/api/proxy/events${query}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch events");

  const json = await res.json();
  return {
    ...json,
    data: (json.data as any[])?.map(normalizeEvent) ?? [],
  };
}

// ============================================
// CLUBS (paginated)
// ============================================

export async function fetchClubsPaginated(search?: string, page?: number, pageSize?: number): Promise<PaginatedResponse<ClubData>> {
  const BASE_URL = getBaseUrl();
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (page) params.set("page", String(page));
  if (pageSize) params.set("page_size", String(pageSize));

  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`${BASE_URL}/api/proxy/clubs${query}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch clubs");

  return res.json();
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export async function subscribe(data: ISubscribeRequest): Promise<IApiResponse<ISubscription>> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
}

export async function subscribeToClub(clubId: string, email: string) {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/clubs/${clubId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
}

export async function unsubscribe(token: string): Promise<IApiResponse<null>> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/unsubscribe/${token}`, {
    method: "DELETE",
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
}

export async function getAdminSubscriptions(): Promise<ISubscription[]> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/admin/subscriptions`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch subscriptions");

  const json = await res.json();
  return json.data;
}

export async function cleanupStorage(): Promise<{ success: boolean; total_in_storage: number; orphans_found: number; deleted: number }> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/cleanup-storage`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Cleanup failed");
  return res.json();
}
/**
 * --- SCRAPED EVENTS (admin approval inbox) ---
 * All routes require an admin JWT; the proxy adds x-api-key.
 * 400/409 bodies carry an admin-readable `detail` string — handleApiError surfaces it verbatim.
 */

// List candidates, highest confidence first.
export async function getScrapedEvents(
  filters: IScrapedEventFilters = {}
): Promise<PaginatedResponse<IScrapedEvent>> {
  const BASE_URL = getBaseUrl();
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.kind && filters.kind !== "all") params.set("kind", filters.kind);
  if (filters.clubId) params.set("clubId", filters.clubId);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 20));

  const res = await fetch(`${BASE_URL}/api/proxy/admin/scraped-events?${params}`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

export async function getScrapedEvent(id: string): Promise<IApiResponse<IScrapedEvent>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/scraped-events/${id}`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

// Fix what the extractor got wrong before approving. 409 if already approved.
export async function updateScrapedEvent(
  id: string,
  data: IScrapedEventUpdate
): Promise<IApiResponse<IScrapedEvent>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/scraped-events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

// Publishes the candidate — returns the created event. 400 if club/date/title/location missing.
export async function approveScrapedEvent(
  id: string,
  overrides: IScrapedEventApprove = {}
): Promise<IApiResponse<IEvent>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/scraped-events/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(overrides),
  });

  if (!res.ok) await handleApiError(res);
  const json = await res.json();
  return { ...json, data: json.data ? normalizeEvent(json.data) : json.data };
}

// Publishes an announcement candidate — returns the created announcement.
// 400 if title/body missing, or if the row is an event (the detail names /approve).
export async function approveScrapedAnnouncement(
  id: string,
  overrides: IScrapedAnnouncementApprove = {}
): Promise<IApiResponse<IAnnouncement>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/scraped-events/${id}/approve-announcement`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(overrides),
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

export async function rejectScrapedEvent(
  id: string,
  rejectionReason?: string
): Promise<IApiResponse<IScrapedEvent>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/scraped-events/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ rejectionReason }),
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

// Removes the staging row only — a published event, if any, is left alone.
export async function deleteScrapedEvent(id: string): Promise<IApiResponse<null>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/scraped-events/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

// "Refresh inbox" — pulls newly extracted candidates from the pipeline DB.
export async function importScrapedEvents(): Promise<IApiResponse<IScrapedImportResult>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/scraped-events/import`, {
    method: "POST",
    headers: getAuthHeader(),
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

/**
 * --- INSTAGRAM HANDLE -> PUBLISHER MAPPINGS ---
 * Learned whenever an admin assigns a club to a candidate or approves one.
 * Separate from a club's self-declared ClubData.igUsername; the mapping wins.
 */
export async function getIgClubMappings(): Promise<IApiResponse<IIgClubMapping[]>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(`${BASE_URL}/api/proxy/admin/ig-club-mappings`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

export async function deleteIgClubMapping(clubUsername: string): Promise<IApiResponse<null>> {
  const BASE_URL = getBaseUrl();
  const res = await fetch(
    `${BASE_URL}/api/proxy/admin/ig-club-mappings/${encodeURIComponent(clubUsername)}`,
    { method: "DELETE", headers: getAuthHeader() }
  );

  if (!res.ok) await handleApiError(res);
  return res.json();
}
