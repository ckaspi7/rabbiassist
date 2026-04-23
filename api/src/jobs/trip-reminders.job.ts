import { supabase } from '../db/client.js';
import { sendTripReminders } from '../services/reminders/trip-reminders.js';

export const JOB_NAME = 'trip-reminders';

export async function handler(): Promise<void> {
  const { data: users } = await supabase.from('users').select('id');

  for (const user of users ?? []) {
    try {
      await sendTripReminders(user.id);
    } catch (err) {
      console.error(`[trip-reminders] Failed for user ${user.id}:`, err);
    }
  }
}
