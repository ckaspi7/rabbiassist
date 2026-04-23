import { supabase } from '../db/client.js';
import { pullCalendarToSupabase } from '../services/calendar/pull-sync.js';

export const JOB_NAME = 'calendar-pull';

export async function handler(): Promise<void> {
  const { data: users } = await supabase
    .from('users')
    .select('id, email, google_refresh_token')
    .not('google_refresh_token', 'is', null);

  const updatedMin = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  for (const user of users ?? []) {
    try {
      await pullCalendarToSupabase(user.id, user.email, updatedMin);
    } catch (err) {
      console.error(`[calendar-pull] Failed for user ${user.id}:`, err);
    }
  }
}
