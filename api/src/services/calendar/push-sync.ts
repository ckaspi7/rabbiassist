import { supabase } from '../../db/client.js';
import { createEvent, updateEvent, deleteEvent } from './client.js';
import type { CalendarEvent } from '../../db/types.js';

function toGCalEvent(event: CalendarEvent) {
  const dtStart = event.all_day
    ? { date: event.event_datetime.split('T')[0] }
    : { dateTime: event.event_datetime, timeZone: event.timezone ?? 'UTC' };

  const dtEnd = event.end_datetime
    ? event.all_day
      ? { date: event.end_datetime.split('T')[0] }
      : { dateTime: event.end_datetime, timeZone: event.timezone ?? 'UTC' }
    : dtStart;

  return {
    summary: event.title,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    start: dtStart,
    end: dtEnd,
  };
}

// Processes pending Supabase events → pushes to Google Calendar, then updates sync_status.
export async function pushSupabaseToCalendar(userId: string, calendarId: string): Promise<void> {
  const { data: pending } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .eq('sync_status', 'pending')
    .eq('deleted', false)
    .lte('sync_attempts', 3);

  for (const event of pending ?? []) {
    try {
      let googleEventId = event.google_event_id;
      if (googleEventId) {
        await updateEvent(userId, calendarId, googleEventId, toGCalEvent(event));
      } else {
        const created = await createEvent(userId, calendarId, toGCalEvent(event));
        googleEventId = created.id ?? null;
      }

      await supabase
        .from('events')
        .update({
          sync_status: 'synced',
          google_event_id: googleEventId,
          last_synced_at: new Date().toISOString(),
          sync_error: null,
        })
        .eq('id', event.id);
    } catch (err) {
      await supabase
        .from('events')
        .update({
          sync_status: 'error',
          sync_attempts: (event.sync_attempts ?? 0) + 1,
          sync_error: String(err),
        })
        .eq('id', event.id);
    }
  }
}

// Finds soft-deleted events in Supabase and deletes them from Google Calendar.
export async function processDeletions(userId: string, calendarId: string): Promise<void> {
  const { data: toDelete } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted', true)
    .eq('sync_status', 'pending')
    .not('google_event_id', 'is', null);

  for (const event of (toDelete as CalendarEvent[]) ?? []) {
    if (!event.google_event_id) continue;
    try {
      await deleteEvent(userId, calendarId, event.google_event_id);
      await supabase
        .from('events')
        .update({ sync_status: 'synced', deletion_synced_at: new Date().toISOString() })
        .eq('id', event.id);
    } catch (err) {
      await supabase
        .from('events')
        .update({ sync_status: 'error', sync_error: String(err) })
        .eq('id', event.id);
    }
  }
}
