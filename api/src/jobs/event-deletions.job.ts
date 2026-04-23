import { supabase } from '../db/client.js';
import { processDeletions } from '../services/calendar/push-sync.js';

export const JOB_NAME = 'event-deletions';

export async function handler(): Promise<void> {
  const { data: users } = await supabase
    .from('users')
    .select('id, email, google_refresh_token')
    .not('google_refresh_token', 'is', null);

  for (const user of users ?? []) {
    try {
      await processDeletions(user.id, user.email);
    } catch (err) {
      console.error(`[event-deletions] Failed for user ${user.id}:`, err);
    }
  }
}
