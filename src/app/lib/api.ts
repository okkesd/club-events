import { IWeekEventsResponse, IEvent } from './types';
import { getWeekStartDate } from './dateUtils';

// --- MOCK DATABASE ---
// This is our mock data. In a real app, this would be in a database.
const allEvents: IEvent[] = [
  { 
    id: 'evt-1', 
    title: 'Intro to React', 
    clubName: 'Coding Club', 
    startTime: '10:00', 
    endTime: '11:00', 
    date: '2025-10-27', 
    location: 'Room 101, Tech Hall',
    description: 'Join us to learn the basics of React...',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop',
    tags: ['Workshop', 'Free Food'],
    
    // LOGIC: On-campus (No directions), Registration Open (Show button)
    locationType: 'on-campus',
    isRegistrationOpen: true,
    //registrationLink: 'https://google.com',
    capacity: 30
  },
  { 
    id: 'evt-2', 
    title: 'Robotics Workshop', 
    clubName: 'Robotics Club', 
    startTime: '14:00', 
    endTime: '16:00', 
    date: '2026-01-16',
    location: 'Engineering Lab B',
    description: 'Build and program your first robot...',
    coverImage: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?q=80&w=1000&auto=format&fit=crop',
    tags: ['Hardware', 'Hands-on'],
    
    // LOGIC: On-campus, Registration CLOSED (Button hidden even if link exists)
    locationType: 'on-campus',
    isRegistrationOpen: false, 
    registrationLink: 'https://robotics.example.com/signup',
    capacity: 15
  },
  { 
    id: 'evt-5', 
    title: 'Stargazing Night', 
    clubName: 'Astronomy Club', 
    startTime: '20:00', 
    endTime: '22:00', 
    date: '2026-01-25', 
    location: 'City Observatory (Downtown)',
    description: 'Join us to look at Mars...',
    coverImage: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1000&auto=format&fit=crop',
    tags: ['Outdoors', 'Science'],
    
    // LOGIC: Off-campus (Show Directions), No registration needed
    locationType: 'off-campus',
    isRegistrationOpen: true, // true, but no link, so button still won't show
    capacity: 50
  }
  // ... other events
];
// --- END MOCK DATABASE ---


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
  await new Promise(resolve => setTimeout(resolve, 300)); 
  
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