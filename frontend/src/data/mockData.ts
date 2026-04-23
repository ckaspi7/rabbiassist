
import { Trip, Reminder, Event, ChatMessage } from '../types';

// Mock trips data
export const mockTrips: Trip[] = [
  {
    id: '1',
    title: 'Jerusalem Conference',
    destination: 'Jerusalem, Israel',
    startDate: '2025-05-15',
    endDate: '2025-05-20',
    checklist: {
      flight: true,
      hotel: true,
      car: false,
      insurance: true
    },
    documents: [
      {
        id: '1',
        name: 'Flight Ticket.pdf',
        type: 'pdf',
        url: '/documents/flight-ticket.pdf'
      },
      {
        id: '2',
        name: 'Hotel Reservation.pdf',
        type: 'pdf',
        url: '/documents/hotel-reservation.pdf'
      }
    ]
  },
  {
    id: '2',
    title: 'New York Synagogue Visit',
    destination: 'New York, USA',
    startDate: '2025-05-25',
    endDate: '2025-05-28',
    checklist: {
      flight: true,
      hotel: true,
      car: true,
      insurance: false
    },
    documents: [
      {
        id: '3',
        name: 'Flight Ticket.pdf',
        type: 'pdf',
        url: '/documents/flight-ticket-ny.pdf'
      },
      {
        id: '4',
        name: 'Car Rental Agreement.pdf',
        type: 'pdf',
        url: '/documents/car-rental.pdf'
      }
    ]
  },
  {
    id: '3',
    title: 'Berlin Torah Summit',
    destination: 'Berlin, Germany',
    startDate: '2025-06-10',
    endDate: '2025-06-15',
    checklist: {
      flight: true,
      hotel: false,
      car: false,
      insurance: false
    },
    documents: [
      {
        id: '5',
        name: 'Flight Ticket.pdf',
        type: 'pdf',
        url: '/documents/flight-ticket-berlin.pdf'
      }
    ]
  }
];

// Mock reminders data
export const mockReminders: Reminder[] = [
  {
    id: '1',
    title: 'Book Flight to Jerusalem',
    description: 'Need to confirm flight reservation for Jerusalem trip',
    date: '2025-05-09',
    completed: false,
    status: 'upcoming',
    category: 'Travel'
  },
  {
    id: '2',
    title: 'Renew Passport',
    description: 'Passport expires in 2 months, needs renewal',
    date: '2025-05-04',
    completed: false,
    status: 'overdue',
    category: 'Documents'
  },
  {
    id: '3',
    title: 'Check-in for Flight BA456',
    description: 'Online check-in for London flight',
    date: '2025-05-07',
    completed: false,
    status: 'upcoming',
    category: 'Travel'
  },
  {
    id: '4',
    title: 'Prepare Torah Class Materials',
    description: 'Compile notes and handouts for next week\'s class',
    date: '2025-05-08',
    completed: false,
    status: 'upcoming',
    category: 'Teaching'
  }
];

// Mock events data
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Torah Class',
    date: '2025-05-05',
    time: '10:00 AM',
    location: 'Main Synagogue',
    description: 'Weekly Torah study session',
    type: 'routine',
    whatsappGroup: 'Torah Study Group'
  },
  {
    id: '2',
    title: 'Brit Milah Ceremony',
    date: '2025-05-05',
    time: '2:30 PM',
    location: 'Cohen Family Home',
    description: 'Ceremonial circumcision for the Cohen family newborn',
    type: 'special'
  },
  {
    id: '3',
    title: 'Evening Prayer',
    date: '2025-05-05',
    time: '6:45 PM',
    location: 'Main Synagogue',
    description: 'Daily evening prayer service',
    type: 'routine',
    whatsappGroup: 'Congregation General'
  },
  {
    id: '4',
    title: 'Bar Mitzvah Planning',
    date: '2025-05-07',
    time: '4:00 PM',
    location: 'Rabbi\'s Office',
    description: 'Meeting with Goldstein family to plan Bar Mitzvah',
    type: 'other'
  }
];

// Mock chat messages data
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello! How can I assist you today?',
    sender: 'assistant',
    timestamp: '9:30 AM'
  }
];
