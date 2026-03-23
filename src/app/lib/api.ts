import { IEvent, ClubData, IApiResponse, IClubUpdate, IEventUpdate, SignUpData, IAnnouncement, IAnnouncementCreate, IAnnouncementUpdate, IAnnouncementFilters } from './types';
import { getWeekStartDate } from './dateUtils';

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4444";
const PROXY_URL = process.env.PROXY_URL || "/api/proxy";

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
      data = raw_data["data"]
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
export const fetchEventById = async (eventId: string): Promise<IEvent | null> => {
  if (!eventId) return null;
  console.log(`Fetching event with ID: ${eventId}`);
  const BASE_URL = getBaseUrl();
  //let functionURL = URL + `events/${eventId}`
  let functionURL = `${BASE_URL}/api/proxy/events/${eventId}`;
  console.log(`Fetching from: ${functionURL}`); // Debugging
  

  let data
  try {
    const response = await fetch(functionURL)
    if (response.ok){
      const raw_data = await response.json()
      data = raw_data["data"]
      return data as IEvent;
      
    } else {
      if (!response.ok) {
        // Handle 404 specifically if you want to show "Event not found" vs "Server Error"
        if (response.status === 404) console.warn(`Event ${eventId} not found`);
        throw new Error(`Failed to get event`);
      }
      throw new Error(`failed to get event ${eventId}`)
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

export const fetchEventsByClubId = async (clubId: string) :Promise<IEvent[]|null> => {
  console.log(`Fetching events by club id ${clubId}`)
  const BASE_URL = getBaseUrl();
  let functionURL = `${BASE_URL}/api/proxy/clubs/` + clubId + "/events"

  try {
    const response = await fetch(functionURL, {"cache": "no-store"})
    if (response.ok){
      const raw_data = await response.json()
      return raw_data.data
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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create event");
    }

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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update club profile");
    }

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
export async function updateEvent(eventId: string, data: IEventUpdate) {
  const BASE_URL = getBaseUrl();

    const res = await fetch(`${BASE_URL}/api/proxy/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update event");
    }
    return res.json();
}

export async function getAllClubsUser(search?: string): Promise<ClubData[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    let BASE_URL = getBaseUrl()


    const res = await fetch(`${BASE_URL}/api/proxy/clubs${query}`, { cache: 'no-store' });
    
    if (!res.ok) throw new Error("Failed to fetch clubs");
    
    const json = await res.json();
    return json.data;
}

export async function toggleEventLike(eventId: string, hasLiked: boolean): Promise<number> {

  const BASE_URL = getBaseUrl()


  const res = await fetch(`${BASE_URL}/api/proxy/event_like/${eventId}`, {
    method: 'POST',  // Changed from GET
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ liked: hasLiked }),  // Send as body, not query param
    cache: 'no-store',  // Ensure no caching
  });

  if (!res.ok) throw new Error("Failed to like")

  const json = await res.json()
  return json.data.likes
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

  if (!res.ok){
    const error = await res.json()
    throw new Error(`Error contact: ${error}`)
  }

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
    const resposne = await res.json()
    throw new Error(`Failed to get contacts: ${resposne}`)
  }
  const result = await res.json()
  console.log(result)

  return result
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export async function fetchAnnouncements(filters?: IAnnouncementFilters): Promise<IAnnouncement[]> {
  const BASE_URL = getBaseUrl();
  const params = new URLSearchParams();

  if (filters?.category) params.set("category", filters.category);
  if (filters?.club_id) params.set("club_id", filters.club_id);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.include_expired) params.set("include_expired", "true");

  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`${BASE_URL}/api/proxy/announcements${query}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch announcements");

  const json = await res.json();
  return json.data;
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

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create announcement");
  }

  return res.json();
}

export async function updateAnnouncement(id: string, data: IAnnouncementUpdate): Promise<IApiResponse<IAnnouncement>> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/announcements/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update announcement");
  }

  return res.json();
}

export async function deleteAnnouncement(id: string): Promise<IApiResponse<IAnnouncement>> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/announcements/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to delete announcement");
  }

  return res.json();
}

export async function fetchAnnouncementsByClubId(clubId: string): Promise<IAnnouncement[]> {
  const BASE_URL = getBaseUrl();

  const res = await fetch(`${BASE_URL}/api/proxy/announcements?club_id=${clubId}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch club announcements");

  const json = await res.json();
  return json.data;
}