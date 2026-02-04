import { IEvent, ClubData, IApiResponse, IClubUpdate, IEventUpdate } from './types';
import { getWeekStartDate } from './dateUtils';

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4444";
const PROXY_URL = process.env.PROXY_URL || "/api/proxy";

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

  try {
    const response = await fetch(`${BASE_URL}/api/proxy/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      return json.url; // Returns "http://localhost:4444/static/..."
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

    const response = await fetch(`${BASE_URL}/api/proxy/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json",},
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

    const response = await fetch(`${BASE_URL}/api/proxy/clubs/${clubId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
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

    const res = await fetch(`${BASE_URL}/api/proxy/admin/clubs${query}`, { cache: 'no-store' });
    
    if (!res.ok) throw new Error("Failed to fetch clubs");
    return res.json();
}

// 2. Verify or Reject a club
export async function setClubVerification(clubId: string, isVerified: boolean, reason?: string) {
  const BASE_URL = getBaseUrl();

    const res = await fetch(`${BASE_URL}/api/proxy/admin/clubs/${clubId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            is_verified: isVerified,
            rejection_reason: reason 
        }),
    });

    if (!res.ok) throw new Error("Failed to update verification status");
    return res.json();
}

// to update an event by its owner
export async function updateEvent(eventId: string, data: IEventUpdate) {
  const BASE_URL = getBaseUrl();

    const res = await fetch(`${BASE_URL}/api/proxy/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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