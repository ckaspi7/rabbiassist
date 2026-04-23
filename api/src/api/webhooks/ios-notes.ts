import { FastifyPluginAsync } from 'fastify';
import { supabase } from '../../db/client.js';
import { extractTasks } from '../../services/ai/task-extractor.js';
import { deduplicateTasks } from '../../services/ai/deduplicator.js';
import { BadRequest, Unauthorized } from '../../lib/errors.js';

interface IosNotesBody {
  user_secret: string;
  note_title: string;
  note_content: string;
  created_at: string;
  modified_at: string;
  source?: string;
}

const iosNotesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: IosNotesBody }>('/webhooks/ios-notes', async (request, reply) => {
    const { user_secret, note_title, note_content, created_at, modified_at, source = 'ios-notes' } =
      request.body ?? {};

    if (!user_secret) throw BadRequest('Missing user_secret');

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('user_secret', user_secret)
      .single();

    if (!user) throw Unauthorized('Invalid user_secret');

    const userId = user.id;

    const newTasks = await extractTasks(
      userId,
      note_title ?? '',
      note_content ?? '',
      created_at ?? new Date().toISOString(),
      modified_at ?? new Date().toISOString(),
      source,
    );

    if (!newTasks.length) {
      return reply.send({ inserted: 0 });
    }

    const { data: existing } = await supabase
      .from('reminders')
      .select('id, title, due_date')
      .eq('user_id', userId)
      .eq('source', 'ios-notes');

    const uniqueTasks = await deduplicateTasks(newTasks, existing ?? []);

    for (const task of uniqueTasks) {
      await supabase.from('reminders').insert({
        user_id: userId,
        title: task.task,
        due_date: task.due_date,
        source: task.source,
        has_due_date: Boolean(task.due_date),
        is_completed: false,
        reminder_sent: false,
        metadata: {
          note_title: task.note_title,
          note_content: task.note_content,
          created_at: task.created_at,
          modified_at: task.modified_at,
        },
        created_at: new Date().toISOString(),
      });
    }

    return reply.send({ inserted: uniqueTasks.length, skipped: newTasks.length - uniqueTasks.length });
  });
};

export default iosNotesRoutes;
