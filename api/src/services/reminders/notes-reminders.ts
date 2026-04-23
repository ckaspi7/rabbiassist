import { supabase } from '../../db/client.js';
import { sendPushover } from '../notifications/pushover.js';

// Runs weekly (Monday 9am). Queries incomplete ios-notes reminders with due dates,
// splits into overdue and upcoming, and sends Pushover notifications.
export async function sendNotesReminders(userId: string): Promise<void> {
  const now = new Date();

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('source', 'ios-notes')
    .eq('is_completed', false)
    .eq('has_due_date', true)
    .eq('reminder_sent', false);

  if (!reminders?.length) return;

  const sorted = [...reminders].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );

  const overdue = sorted.filter((r) => new Date(r.due_date) < now);
  const upcoming = sorted.filter((r) => new Date(r.due_date) >= now);

  const messages: { reminder: (typeof sorted)[0]; message: string }[] = [];

  for (const r of overdue) {
    const daysAgo = Math.floor((now.getTime() - new Date(r.due_date).getTime()) / 86400000);
    messages.push({
      reminder: r,
      message: `🔴 <b>OVERDUE (${daysAgo}d ago)</b>: ${r.title}${r.description ? `\n${r.description}` : ''}`,
    });
  }

  for (const r of upcoming) {
    const daysUntil = Math.ceil((new Date(r.due_date).getTime() - now.getTime()) / 86400000);
    messages.push({
      reminder: r,
      message: `📅 <b>Due in ${daysUntil}d</b>: ${r.title}${r.description ? `\n${r.description}` : ''}`,
    });
  }

  for (const { reminder, message } of messages) {
    await sendPushover({ message, title: 'Task Reminder', html: 1 });
    await supabase
      .from('reminders')
      .update({ reminder_sent: true, reminder_type: 'standard' })
      .eq('id', reminder.id);
  }
}
