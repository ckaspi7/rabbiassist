import { FastifyPluginAsync } from 'fastify';
import { supabase } from '../../db/client.js';
import { NotFound, BadRequest } from '../../lib/errors.js';

const remindersRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /reminders
  fastify.get<{ Querystring: { source?: string; completed?: string } }>(
    '/reminders',
    async (request) => {
      let q = supabase
        .from('reminders')
        .select('*')
        .eq('user_id', request.userId)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (request.query.source) q = q.eq('source', request.query.source);
      if (request.query.completed !== undefined) {
        q = q.eq('is_completed', request.query.completed === 'true');
      }
      const { data } = await q;
      return data ?? [];
    },
  );

  // PATCH /reminders/:id
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/reminders/:id',
    async (request) => {
      const allowed = ['is_completed', 'title', 'due_date', 'description'];
      const updates = Object.fromEntries(
        Object.entries(request.body).filter(([k]) => allowed.includes(k)),
      );
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', request.params.id)
        .eq('user_id', request.userId)
        .select()
        .single();
      if (error || !data) throw NotFound();
      return data;
    },
  );

  // DELETE /reminders/:id
  fastify.delete<{ Params: { id: string } }>('/reminders/:id', async (request, reply) => {
    await supabase.from('reminders').delete().eq('id', request.params.id).eq('user_id', request.userId);
    return reply.status(204).send();
  });

  // POST /reminders — manual reminder creation
  fastify.post<{ Body: Record<string, unknown> }>('/reminders', async (request, reply) => {
    const { title, due_date, description, source = 'manual' } = request.body as Record<string, unknown>;
    if (!title) throw BadRequest('title required');

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: request.userId,
        title,
        due_date: due_date ?? null,
        description: description ?? null,
        source,
        has_due_date: Boolean(due_date),
        is_completed: false,
        reminder_sent: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !data) throw BadRequest(error?.message ?? 'Insert failed');
    return reply.status(201).send(data);
  });
};

export default remindersRoutes;
