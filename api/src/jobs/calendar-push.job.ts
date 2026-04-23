import { supabase } from '../db/client.js';
import { pushSupabaseToCalendar } from '../services/calendar/push-sync.js';

export const JOB_NAME = 'calendar-push';

export async function handler(): Promise<void> {
  const { data: users } = await supabase
    .from('users')
    .select('id, email, google_refresh_token')
    .not('google_refresh_token', 'is', null);

  for (const user of users ?? []) {
    try {
      await pushSupabaseToCalendar(user.id, user.email);
    } catch (err) {
      console.error(`[calendar-push] Failed for user ${user.id}:`, err);
    }
  }
}
