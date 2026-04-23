
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  checklist: TripChecklist;
  documents: Document[];
}

export interface TripChecklist {
  flight: boolean;
  hotel: boolean;
  car: boolean;
  insurance: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  status: 'upcoming' | 'overdue' | 'completed';
  category: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'routine' | 'special' | 'other';
  whatsappGroup?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}
