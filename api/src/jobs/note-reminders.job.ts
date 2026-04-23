import { supabase } from '../db/client.js';
import { sendNotesReminders } from '../services/reminders/notes-reminders.js';

export const JOB_NAME = 'note-reminders';

export async function handler(): Promise<void> {
  const { data: users } = await supabase.from('users').select('id');

  for (const user of users ?? []) {
    try {
      await sendNotesReminders(user.id);
    } catch (err) {
      console.error(`[note-reminders] Failed for user ${user.id}:`, err);
    }
  }
}
