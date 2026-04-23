import { supabase } from '../db/client.js';
import { processInbox } from '../services/gmail/inbox-agent.js';

export const JOB_NAME = 'gmail-inbox-poll';

export async function handler(): Promise<void> {
  const { data: users } = await supabase
    .from('users')
    .select('id, email, google_refresh_token')
    .not('google_refresh_token', 'is', null);

  for (const user of users ?? []) {
    try {
      await processInbox(user.id, user.email, user.email);
    } catch (err) {
      console.error(`[gmail-inbox-poll] Failed for user ${user.id}:`, err);
    }
  }
}
