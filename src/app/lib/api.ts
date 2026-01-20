import { IWeekEventsResponse, IEvent, Club, IEventComplex } from './types';
import { getWeekStartDate } from './dateUtils';

const URL = "http://localhost:4444/"

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
  let functionURL = URL + "clubs/" + clubId + "/events"

  try {
    const response = await fetch(functionURL, {"cache": "no-store"})
    if (response.ok){
      const raw_data = await response.json()
      console.log(raw_data)
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