import { IWeekEventsResponse, IEvent, Club, IEventComplex } from './types';
import { getWeekStartDate } from './dateUtils';

const URL = "http://localhost:4444/"

/**
 * Simulates an API call to fetch all events for a given week.
 * @param weekStartDate - The Date object for the Monday of the week.
 */
export const fetchEventsForWeek = async (currentDate: Date): Promise<any[]|null> => {
  console.log(`Fetching events for the week`);
  let functionURL = URL + "main"
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
  let data;
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  console.log(year)
  console.log(month)
  console.log(day)
  console.log(currentDate.toISOString())
  try {
    const response = await fetch(functionURL, {
      method:"POST", 
      body: JSON.stringify({"day": day, "month": month, "year": year}),
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

export const fetcClubById = async (clubId: number): Promise<Club | null> => {
  console.log(`Fetching club wiht id ${clubId}`)

  let functionURL = URL + "clubs/" + String(clubId)

  let data
  try {
    const response = await fetch(functionURL)
    if (response.ok){
      const raw_data = await response.json()
      data = raw_data["data"]
    } else {
      throw new Error(`Failed to fetch club, id ${clubId}`)
    }
  } catch (error){
    console.error(error)
    return null
  }

  return data
}