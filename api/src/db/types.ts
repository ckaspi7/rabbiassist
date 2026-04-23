// Auto-generate with: npx supabase gen types typescript --project-id <id> > src/db/types.ts
// This file is manually maintained until the CLI is configured.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type SyncStatus = 'pending' | 'synced' | 'error';
export type SyncSource = 'web' | 'ios' | 'google';
export type TripItemType = 'flight' | 'hotel' | 'car' | 'travel_insurance' | 'other';
export type TripItemStatus = 'booked' | 'unbooked' | 'cancelled';
export type EventType = string;
export type EventStatus = string;
export type ReminderSource = 'ios-notes' | 'trip' | 'manual';
export type ReminderType = 'standard' | '30_day' | '15_day';

export interface User {
  id: string;
  email: string;
  user_secret: string;
  phone_number: string | null;
  // Google OAuth tokens — stored per user
  google_access_token: string | null;
  google_refresh_token: string | null;
  google_token_expiry: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  inferred_from: TripItemType | null;
  confidence_score: number | null;
  source_email_id: string | null;
  created_at: string;
}

export interface TripItem {
  id: string;
  trip_id: string;
  user_id: string;
  type: TripItemType;
  status: TripItemStatus;
  document_url: string | null;
  start_date: string | null;
  end_date: string | null;
  destination: string | null;
  raw_email_id: string | null;
  created_at: string;
}

export interface TripItemToReview {
  id: string;
  user_id: string;
  type: TripItemType;
  raw_email_id: string | null;
  file_name: string | null;
  mime_type: string | null;
  storage_path: string | null;
  original_name: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  google_event_id: string | null;
  google_calendar_id: string | null;
  google_etag: string | null;
  title: string;
  description: string | null;
  location: string | null;
  event_datetime: string;
  end_datetime: string | null;
  all_day: boolean;
  timezone: string | null;
  recurrence_rule: string | null;
  sync_source: SyncSource;
  sync_status: SyncStatus;
  sync_attempts: number;
  sync_error: string | null;
  last_synced_at: string | null;
  local_modified_at: string;
  remote_modified_at: string | null;
  deleted: boolean;
  deleted_at: string | null;
  deletion_synced_at: string | null;
  is_conflict: boolean;
  type: EventType | null;
  status: EventStatus | null;
  trip_id: string | null;
  whatsapp_group_id: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  trip_id: string | null;
  trip_item_id: string | null;
  type: TripItemType | null;
  file_name: string;
  mime_type: string;
  storage_path: string;
  original_name: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  file_name: string;
  mime_type: string;
  storage_path: string;
  vendor: string | null;
  total_amount: number | null;
  received_date: string | null;
  expense_date: string | null;
  category: string | null;
  details: string | null;
  document_url: string | null;
  email_id: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  due_date: string | null;
  source: ReminderSource;
  metadata: Json | null;
  is_completed: boolean;
  has_due_date: boolean;
  reminder_sent: boolean;
  reminder_type: ReminderType | null;
  trip_id: string | null;
  description: string | null;
  email_id: string | null;
  created_at: string;
}

export interface WhatsappDoc {
  id: string;
  user_id: string;
  file_name: string;
  mime_type: string;
  storage_path: string;
  message_id: string | null;
  created_at: string;
}
