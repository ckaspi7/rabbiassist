import { supabase } from '../../db/client.js';
import { sendPushover } from '../notifications/pushover.js';
import type { TripItemType } from '../../db/types.js';

const REQUIRED_ITEMS: TripItemType[] = ['flight', 'car', 'hotel', 'travel_insurance'];
const WINDOW_30 = 30;
const WINDOW_15 = 15;

interface MissingItems {
  tripId: string;
  destination: string;
  startDate: string;
  missing: TripItemType[];
  reminderType: '30_day' | '15_day';
}

// Runs daily at 9am. For each user, finds upcoming trips and sends 30/15-day reminders
// if required items (flight, hotel, car, travel_insurance) are missing or unbooked.
export async function sendTripReminders(userId: string): Promise<void> {
  const now = new Date();
  const in30 = new Date(now.getTime() + WINDOW_30 * 86400000).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  const { data: trips } = await supabase
    .from('trips')
    .select('id, destination, start_date')
    .eq('user_id', userId)
    .gte('start_date', today)
    .lte('start_date', in30);

  if (!trips?.length) return;

  const toNotify: MissingItems[] = [];

  for (const trip of trips) {
    const { data: items } = await supabase
      .from('trip_items')
      .select('type, status')
      .eq('trip_id', trip.id)
      .eq('user_id', userId);

    const bookedTypes = new Set(
      (items ?? []).filter((i) => i.status === 'booked').map((i) => i.type as TripItemType),
    );
    const missing = REQUIRED_ITEMS.filter((t) => !bookedTypes.has(t));
    if (!missing.length) continue;

    // Determine reminder type based on proximity
    const daysUntil = Math.ceil(
      (new Date(trip.start_date).getTime() - now.getTime()) / 86400000,
    );
    const reminderType = daysUntil <= WINDOW_15 ? '15_day' : '30_day';

    // Check if we already sent this reminder type
    const { data: existing } = await supabase
      .from('reminders')
      .select('id')
      .eq('user_id', userId)
      .eq('trip_id', trip.id)
      .eq('reminder_type', reminderType)
      .eq('reminder_sent', true);

    if (existing?.length) continue;

    toNotify.push({ tripId: trip.id, destination: trip.destination, startDate: trip.start_date, missing, reminderType });
  }

  for (const item of toNotify) {
    const missingList = item.missing.join(', ');
    const urgency = item.reminderType === '15_day' ? '🔴 URGENT' : '📅';
    const message = `${urgency} <b>${item.destination}</b> (${item.startDate})\nMissing: <b>${missingList}</b>`;

    await sendPushover({
      message,
      title: 'Trip Reminder',
      priority: item.reminderType === '15_day' ? 1 : 0,
      html: 1,
    });

    await supabase.from('reminders').insert({
      user_id: userId,
      title: `${item.destination} trip check (${item.reminderType})`,
      source: 'trip',
      trip_id: item.tripId,
      reminder_type: item.reminderType,
      reminder_sent: true,
      has_due_date: false,
      is_completed: false,
      created_at: new Date().toISOString(),
    });
  }
}
