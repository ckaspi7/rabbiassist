import { supabase } from '../../db/client.js';
import { listChangedEvents } from './client.js';
import type { GCalEvent } from './client.js';

function toSupabaseEvent(event: GCalEvent, userId: string, calendarId: string) {
  const startDt = event.start?.dateTime ?? event.start?.date ?? '';
  const endDt = event.end?.dateTime ?? event.end?.date ?? '';
  const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);

  return {
    user_id: userId,
    google_event_id: event.id,
    google_calendar_id: calendarId,
    google_etag: event.etag,
    title: event.summary ?? '(no title)',
    description: event.description ?? null,
    location: event.location ?? null,
    event_datetime: startDt,
    end_datetime: endDt || null,
    all_day: isAllDay,
    timezone: event.start?.timeZone ?? null,
    recurrence_rule: event.recurrence?.[0] ?? null,
    sync_source: 'google' as const,
    sync_status: 'synced' as const,
    last_synced_at: new Date().toISOString(),
    remote_modified_at: event.updated ?? null,
    deleted: event.status === 'cancelled',
    deleted_at: event.status === 'cancelled' ? new Date().toISOString() : null,
  };
}

// Pulls recent Google Calendar changes and upserts them to the events table.
// updatedMin should be set to the last sync timestamp (ISO string).
export async function pullCalendarToSupabase(
  userId: string,
  calendarId: string,
  updatedMin: string,
): Promise<void> {
  const events = await listChangedEvents(userId, calendarId, updatedMin);

  for (const event of events) {
    if (!event.id) continue;

    const row = toSupabaseEvent(event, userId, calendarId);

    await supabase
      .from('events')
      .upsert(row, { onConflict: 'google_event_id,user_id' })
      .throwOnError();
  }
}
