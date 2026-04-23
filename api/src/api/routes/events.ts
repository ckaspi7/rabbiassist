import { FastifyPluginAsync } from 'fastify';
import { supabase } from '../../db/client.js';
import { NotFound, BadRequest } from '../../lib/errors.js';

const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /events
  fastify.get<{ Querystring: { from?: string; to?: string } }>('/events', async (request) => {
    let q = supabase
      .from('events')
      .select('*')
      .eq('user_id', request.userId)
      .eq('deleted', false)
      .order('event_datetime', { ascending: true });

    if (request.query.from) q = q.gte('event_datetime', request.query.from);
    if (request.query.to) q = q.lte('event_datetime', request.query.to);

    const { data } = await q;
    return data ?? [];
  });

  // GET /events/:id
  fastify.get<{ Params: { id: string } }>('/events/:id', async (request) => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', request.params.id)
      .eq('user_id', request.userId)
      .single();
    if (!data) throw NotFound();
    return data;
  });

  // POST /events — creates a new local event; sync job will push to Google Calendar.
  fastify.post<{ Body: Record<string, unknown> }>('/events', async (request, reply) => {
    const { title, event_datetime, end_datetime, all_day, description, location, timezone, trip_id } =
      request.body as Record<string, unknown>;
    if (!title || !event_datetime) throw BadRequest('title and event_datetime required');

    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: request.userId,
        title,
        event_datetime,
        end_datetime: end_datetime ?? null,
        all_day: all_day ?? false,
        description: description ?? null,
        location: location ?? null,
        timezone: timezone ?? 'UTC',
        trip_id: trip_id ?? null,
        sync_source: 'web',
        sync_status: 'pending',
        sync_attempts: 0,
        deleted: false,
        is_conflict: false,
        local_modified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !data) throw BadRequest(error?.message ?? 'Insert failed');
    return reply.status(201).send(data);
  });

  // PATCH /events/:id
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/events/:id',
    async (request) => {
      const allowed = ['title', 'event_datetime', 'end_datetime', 'description', 'location', 'all_day', 'timezone'];
      const updates = {
        ...Object.fromEntries(Object.entries(request.body).filter(([k]) => allowed.includes(k))),
        sync_status: 'pending',
        local_modified_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', request.params.id)
        .eq('user_id', request.userId)
        .select()
        .single();
      if (error || !data) throw NotFound();
      return data;
    },
  );

  // DELETE /events/:id — soft delete; sync job will remove from Google Calendar.
  fastify.delete<{ Params: { id: string } }>('/events/:id', async (request, reply) => {
    await supabase
      .from('events')
      .update({ deleted: true, deleted_at: new Date().toISOString(), sync_status: 'pending' })
      .eq('id', request.params.id)
      .eq('user_id', request.userId);
    return reply.status(204).send();
  });
};

export default eventsRoutes;
