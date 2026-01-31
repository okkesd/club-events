import { IWeekEventsResponse, IEvent, Club, IEventComplex, IApiResponse, IClubUpdate, IEventUpdate } from './types';
import { getWeekStartDate } from './dateUtils';

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4444";

const formatDateToLocalISO = (date: Date): string => {
  const year = date.getFullYear();
  // Month is 0-indexed in JS, so we add 1
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Simulates an API call to fetch all events for a given week.
 * @param weekStartDate - The Date object for the Monday of the week.
 */
export const fetchEventsForWeek = async (currentDate: Date): Promise<IEventComplex[]|null> => {
  console.log(`Fetching events for the week`);
  const date_str = formatDateToLocalISO(currentDate)
  let functionURL = URL + `events/weekly?date=${date_str}`
  /*const events: IWeekEventsResponse = {};
  
  // Create a Set of dates for the week
  const weekDates = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStartDate);
    day.setDate(day.getDate() + i);
    weekDates.add(day.toISOString().split('T')[0]);
  }

  // Filter allEvents to find ones that fall in this week
  const weekEvents = allEvents.filter(event => weekDates.has(event.date));

  // Group events by their date
  for (const event of weekEvents) {
    if (!events[event.date]) {
      events[event.date] = [];
    }
    events[event.date].push(event);
  }*/
  let data;/*
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  console.log(year)
  console.log(month)
  console.log(day)
  console.log(currentDate.toISOString())*/
  try {
    const response = await fetch(functionURL, {
      method:"GET", 
      //body: JSON.stringify({"day": day, "month": month, "year": year}),
      headers: {"Content-Type": "application/json"}
    })
    if (response.ok){
      let raw_data = await response.json()
      data = raw_data["data"]
      console.log(data)
      console.log(typeof(data))
    } else {
      throw new Error("Failed to fetch")
    }
  } catch (error) {
    console.error("error", error)
    return null
  }

  return data;
};


/**
 * * NEW FUNCTION *
 * Simulates an API call to fetch a single event by its ID.
 * @param eventId - The unique ID of the event.
 */
export const fetchEventById = async (eventId: string): Promise<IEventComplex | null> => {
  console.log(`Fetching event with ID: ${eventId}`);
  let functionURL = URL + `events/${eventId}`
  
  // Find the event in our mock database
  //const event = allEvents.find(e => e.id === eventId);
  let data
  try {
    const response = await fetch(functionURL)
    if (response.ok){
      const raw_data = await response.json()
      data = raw_data["data"]
      
    } else {
      throw new Error(`failed to get event ${eventId}`)
    }
  } catch (error) {
    console.error("error ", error)
    return null
  }
  
  // Simulate network delay
  //await new Promise(resolve => setTimeout(resolve, 300));
  
  return data;
};

export const fetchClubById = async (clubId: string): Promise<Club | null> => {
  console.log(`Fetching club wiht id ${clubId}`)

  let functionURL = URL + "clubs/" + clubId

  let data
  try {
    const response = await fetch(functionURL, {"cache": "no-store"})
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

export const fetchEventsByClubId = async (clubId: string) :Promise<IEventComplex[]|null> => {
  console.log(`Fetching events by club id ${clubId}`)
  let functionURL = URL + "clubs/" + clubId + "/events"

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

  try {
    const response = await fetch(`${URL}upload`, {
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

export async function createEvent(eventData: any): Promise<IApiResponse<IEventComplex>> {
    const response = await fetch(`${URL}events`, {
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

export async function getAllClubs(): Promise<Club[] | null> {

  try {
    const response = await fetch(`${URL}all_clubs`, {"cache": "no-cache"})
  
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

export async function updateClub(clubId: string, updateData: IClubUpdate): Promise<IApiResponse<Club>> {
    const response = await fetch(`${URL}clubs/${clubId}`, {
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
export async function getAdminClubs(status?: 'verified' | 'pending'): Promise<Club[]> {
    // Build URL with query param if status exists
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${URL}admin/clubs${query}`, { cache: 'no-store' });
    
    if (!res.ok) throw new Error("Failed to fetch clubs");
    return res.json();
}

// 2. Verify or Reject a club
export async function setClubVerification(clubId: string, isVerified: boolean, reason?: string) {
    const res = await fetch(`${URL}admin/clubs/${clubId}/status`, {
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
    const res = await fetch(`${URL}events/${eventId}`, {
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