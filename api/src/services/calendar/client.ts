import { google, calendar_v3 } from 'googleapis';
import { supabase } from '../../db/client.js';
import { config } from '../../config.js';

async function getAuthedClient(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('id', userId)
    .single();

  if (!user?.google_refresh_token) {
    throw new Error(`No Google refresh token for user ${userId}`);
  }

  const auth = new google.auth.OAuth2(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
    expiry_date: user.google_token_expiry ? new Date(user.google_token_expiry).getTime() : undefined,
  });

  auth.on('tokens', async (tokens) => {
    await supabase
      .from('users')
      .update({
        google_access_token: tokens.access_token,
        google_token_expiry: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : undefined,
      })
      .eq('id', userId);
  });

  return auth;
}

export type GCalEvent = calendar_v3.Schema$Event;

export async function listChangedEvents(
  userId: string,
  calendarId: string,
  updatedMin: string,
): Promise<GCalEvent[]> {
  const auth = await getAuthedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.list({
    calendarId,
    updatedMin,
    showDeleted: true,
    singleEvents: true,
    maxResults: 250,
  });
  return res.data.items ?? [];
}

export async function createEvent(
  userId: string,
  calendarId: string,
  event: GCalEvent,
): Promise<GCalEvent> {
  const auth = await getAuthedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.insert({ calendarId, requestBody: event });
  return res.data;
}

export async function updateEvent(
  userId: string,
  calendarId: string,
  googleEventId: string,
  event: GCalEvent,
): Promise<GCalEvent> {
  const auth = await getAuthedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.update({
    calendarId,
    eventId: googleEventId,
    requestBody: event,
  });
  return res.data;
}

export async function deleteEvent(
  userId: string,
  calendarId: string,
  googleEventId: string,
): Promise<void> {
  const auth = await getAuthedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId, eventId: googleEventId });
}
