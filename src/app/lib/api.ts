import { IWeekEventsResponse, IEvent , CreateEventData , IClub, IClubPageData , UpdateEventData } from './types';
import { getWeekStartDate } from './dateUtils';

// --- MOCK DATABASE ---
// This is our mock data. In a real app, this would be in a database.
const allEvents: IEvent[] = [
  // Week 1 (Current Week)
  { id: 'evt-1', title: 'Intro to React', clubName: 'Coding Club',clubSlug: 'coding-club', startTime: '10:00', endTime: '11:00', date: '2025-10-27', description: 'Join us to learn the basics of React! No prior experience needed. We will cover components, props, and state.', location: 'Room 101, Tech Hall' },
  { id: 'evt-2', title: 'Robotics Workshop', clubName: 'Robotics Club', clubSlug: 'coding-club', startTime: '14:00', endTime: '16:00', date: '2025-10-27', description: 'Build and program your first robot. All parts will be provided.', location: 'Engineering Lab B' },
  { id: 'evt-3', title: 'Debate Meetup', clubName: 'Debate Society', clubSlug: 'coding-club', startTime: '17:00', endTime: '18:00', date: '2025-10-30', description: 'This week\'s topic: "Is AI beneficial for society?" Come to argue or just to listen!', location: 'Social Sciences Bldg, Room 204' },
  
  // Week 2 (Next Week)
  { id: 'evt-4', title: 'Guest Speaker: Jane Doe', clubName: 'Coding Club', clubSlug: 'coding-club', startTime: '18:00', endTime: '19:00', date: '2025-11-03', description: 'Hear from Jane Doe, a software engineer at Google, about her journey into tech.', location: 'Main Auditorium' },
  { id: 'evt-5', title: 'Stargazing Night', clubName: 'Astronomy Club', clubSlug: 'coding-club', startTime: '20:00', endTime: '22:00', date: '2025-11-05', description: 'Join us on the observatory hill to look at Mars and the Andromeda Galaxy.', location: 'Observatory Hill' },
];

const allClubs: IClub[] = [
  { 
    id: 'club-1', 
    name: 'Coding Club', 
    slug: 'coding-club',
    logoUrl: 'https://placehold.co/100x100/4299E1/FFFFFF?text=CC',
    leaderName: 'Alex Johnson',
    contactEmail: 'coding@unievents.com',
    purpose: 'To foster a community of student programmers and explore new technologies. We host weekly workshops, guest speakers, and hackathons.'
  },
  { 
    id: 'club-2', 
    name: 'Robotics Club', 
    slug: 'robotics-club',
    logoUrl: 'https://placehold.co/100x100/E53E3E/FFFFFF?text=RC',
    leaderName: 'Samira Chen',
    contactEmail: 'robotics@unievents.com',
    purpose: 'Building, competing, and learning all things robotics. Open to all skill levels, from beginners to experienced builders.'
  },
  {
    id: 'club-3',
    name: 'Debate Society',
    slug: 'debate-society',
    logoUrl: 'https://placehold.co/100x100/38A169/FFFFFF?text=DS',
    leaderName: 'David Kim',
    contactEmail: 'debate@unievents.com',
    purpose: 'Sharpening minds through reasoned discourse. We compete in regional tournaments and hold public debates on campus.'
  },
  {
    id: 'club-4',
    name: 'Astronomy Club',
    slug: 'astronomy-club',
    logoUrl: 'https://placehold.co/100x100/6B46C1/FFFFFF?text=AC',
    leaderName: 'Maria Rodriguez',
    contactEmail: 'astro@unievents.com',
    purpose: 'Exploring the cosmos together. We host stargazing nights, visit observatories, and discuss the latest in space exploration.'
  }
];

// --- END MOCK DATABASE ---


/**
 * * NEW FUNCTION *
 * Simulates an API call to update an existing event.
 * @param eventId The ID of the event to update.
 * @param data The new data for the event.
 */
export const mockUpdateEventApi = async (
  eventId: string, 
  data: UpdateEventData
): Promise<IEvent> => {
  console.log(`Mock API: Updating event ${eventId}...`, data);

  // --- 
  // NOTE FOR AUTH: In a real backend, this is where you
  // would check the user's auth token *before* doing anything.
  // 1. const user = await getUserByToken(token);
  // 2. const event = await db.findEvent(eventId);
  // 3. if (user.clubName !== event.clubName) {
  // 4.   throw new Error("403 Forbidden: You do not own this event.");
  // 5. }
  // ---

  // Find the event in our mock DB
  const eventIndex = allEvents.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error("Event not found.");
  }

  // Get the original clubName, which cannot be changed
  const originalClubName = allEvents[eventIndex].clubName;
  const originalClubSlug = allEvents[eventIndex].clubSlug;

  // Update the event
  const updatedEvent: IEvent = {
    ...data,       // The new data from the form
    id: eventId,   // The original ID
    clubName: originalClubName, // The original club name
    clubSlug: originalClubSlug,
  };
  
  allEvents[eventIndex] = updatedEvent;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return updatedEvent;
};


/**
 * Simulates an API call to fetch all events for a given week.
 * @param weekStartDate - The Date object for the Monday of the week.
 */
export const fetchEventsForWeek = async (weekStartDate: Date): Promise<IWeekEventsResponse> => {
  console.log(`Fetching events for week starting: ${weekStartDate.toISOString()}`);
  
  const events: IWeekEventsResponse = {};
  
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
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500)); 
  
  return events;
};


/**
 * * NEW FUNCTION *
 * Simulates an API call to fetch a single event by its ID.
 * @param eventId - The unique ID of the event.
 */
export const fetchEventById = async (eventId: string): Promise<IEvent | null> => {
  console.log(`Fetching event with ID: ${eventId}`);
  
  // Find the event in our mock database
  const event = allEvents.find(e => e.id === eventId);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!event) {
    return null; // Not found
  }
  
  return event;
};

/**
 * Simulates an API call to create a new event.
 * @param eventData - The data for the new event.
 */
export const mockCreateEventApi = async (
  eventData: CreateEventData
): Promise<{ newEventId: string }> => {
  console.log("Mock API: Creating event...", eventData);

  // --- Scalability Notes ---
  // 1. DRAFTS: In a real app, we'd add a 'status' field here,
  //    e.g., { ...eventData, status: 'published' } or 'draft'.
  // 2. REVIEWS: The backend would likely default this to
  //    'pending_approval' to be reviewed by an admin.
  // 3. DATABASE: The backend would add this to the 'allEvents' array.

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate a database error
  if (eventData.title.toLowerCase() === "error") {
    throw new Error("Invalid event title. Please try another.");
  }

  // Simulate success by returning a new fake ID
  const newEventId = `evt-${Math.floor(Math.random() * 1000)}`;
  return { newEventId };
};

/**
 * * NEW FUNCTION *
 * Fetches a summary of all clubs for the directory page.
 */
export const fetchAllClubs = async (): Promise<IClub[]> => {
  console.log("Mock API: Fetching all clubs...");
  // In a real app, this would be a database query.
  // We return a copy to prevent mutation.
  await new Promise(resolve => setTimeout(resolve, 300));
  return JSON.parse(JSON.stringify(allClubs));
};

/**
 * Fetches all data for a single club page, by its slug.
 */
export const fetchClubDataBySlug = async (slug: string): Promise<IClubPageData | null> => {
  console.log(`Mock API: Fetching club data for slug: ${slug}`);
  
  // 1. Find the club by its slug
  const club = allClubs.find(c => c.slug === slug);
  
  if (!club) {
    return null; // Club not found
  }
  
  // 2. Find all events for that club
  // We use the club's full name to filter the events
  const clubEvents = allEvents.filter(event => event.clubName === club.name);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. Return the combined data
  return {
    club: JSON.parse(JSON.stringify(club)),
    events: JSON.parse(JSON.stringify(clubEvents))
  };
};