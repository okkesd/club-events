import { IWeekEventsResponse, IEvent } from './types';
import { getWeekStartDate } from './dateUtils';

// --- MOCK DATABASE ---
// This is our mock data. In a real app, this would be in a database.
const allEvents: IEvent[] = [
  // Week 1 (Current Week)
  { id: 'evt-1', title: 'Intro to React', clubName: 'Coding Club', startTime: '10:00', endTime: '11:00', date: '2025-10-27', description: 'Join us to learn the basics of React! No prior experience needed. We will cover components, props, and state.', location: 'Room 101, Tech Hall' },
  { id: 'evt-2', title: 'Robotics Workshop', clubName: 'Robotics Club', startTime: '14:00', endTime: '16:00', date: '2025-10-27', description: 'Build and program your first robot. All parts will be provided.', location: 'Engineering Lab B' },
  { id: 'evt-3', title: 'Debate Meetup', clubName: 'Debate Society', startTime: '17:00', endTime: '18:00', date: '2025-10-30', description: 'This week\'s topic: "Is AI beneficial for society?" Come to argue or just to listen!', location: 'Social Sciences Bldg, Room 204' },
  
  // Week 2 (Next Week)
  { id: 'evt-4', title: 'Guest Speaker: Jane Doe', clubName: 'Coding Club', startTime: '18:00', endTime: '19:00', date: '2025-11-03', description: 'Hear from Jane Doe, a software engineer at Google, about her journey into tech.', location: 'Main Auditorium' },
  { id: 'evt-5', title: 'Stargazing Night', clubName: 'Astronomy Club', startTime: '20:00', endTime: '22:00', date: '2025-11-05', description: 'Join us on the observatory hill to look at Mars and the Andromeda Galaxy.', location: 'Observatory Hill' },
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