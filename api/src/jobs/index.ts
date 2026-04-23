import PgBoss from 'pg-boss';
import { handler as gmailPollHandler, JOB_NAME as GMAIL_POLL } from './gmail-inbox-poll.job.js';
import { handler as calendarPullHandler, JOB_NAME as CAL_PULL } from './calendar-pull.job.js';
import { handler as calendarPushHandler, JOB_NAME as CAL_PUSH } from './calendar-push.job.js';
import { handler as eventDeletionsHandler, JOB_NAME as EVT_DEL } from './event-deletions.job.js';
import { handler as tripRemindersHandler, JOB_NAME as TRIP_REM } from './trip-reminders.job.js';
import { handler as noteRemindersHandler, JOB_NAME as NOTE_REM } from './note-reminders.job.js';

export async function registerJobs(boss: PgBoss): Promise<void> {
  // Polling — every minute
  await boss.schedule(GMAIL_POLL, '* * * * *', {}, { tz: 'UTC' });
  await boss.schedule(CAL_PULL, '* * * * *', {}, { tz: 'UTC' });

  // Sync push + deletions — every 2 minutes
  await boss.schedule(CAL_PUSH, '*/2 * * * *', {}, { tz: 'UTC' });
  await boss.schedule(EVT_DEL, '*/2 * * * *', {}, { tz: 'UTC' });

  // Reminders — daily 9am UTC
  await boss.schedule(TRIP_REM, '0 9 * * *', {}, { tz: 'UTC' });

  // Notes reminders — Monday 9am UTC
  await boss.schedule(NOTE_REM, '0 9 * * 1', {}, { tz: 'UTC' });

  // Register handlers
  await boss.work(GMAIL_POLL, async () => { await gmailPollHandler(); });
  await boss.work(CAL_PULL, async () => { await calendarPullHandler(); });
  await boss.work(CAL_PUSH, async () => { await calendarPushHandler(); });
  await boss.work(EVT_DEL, async () => { await eventDeletionsHandler(); });
  await boss.work(TRIP_REM, async () => { await tripRemindersHandler(); });
  await boss.work(NOTE_REM, async () => { await noteRemindersHandler(); });

  console.log('[jobs] All cron jobs registered');
}
