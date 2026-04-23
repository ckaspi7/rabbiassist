import { FastifyPluginAsync } from 'fastify';
import { supabase } from '../../db/client.js';
import { NotFound, BadRequest } from '../../lib/errors.js';

const tripsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /trips
  fastify.get('/trips', async (request) => {
    const { data } = await supabase
      .from('trips')
      .select('*, trip_items(*)')
      .eq('user_id', request.userId)
      .order('start_date', { ascending: true });
    return data ?? [];
  });

  // GET /trips/:id
  fastify.get<{ Params: { id: string } }>('/trips/:id', async (request) => {
    const { data } = await supabase
      .from('trips')
      .select('*, trip_items(*)')
      .eq('id', request.params.id)
      .eq('user_id', request.userId)
      .single();
    if (!data) throw NotFound();
    return data;
  });

  // POST /trips
  fastify.post<{ Body: Record<string, unknown> }>('/trips', async (request, reply) => {
    const { destination, start_date, end_date } = request.body as {
      destination?: string; start_date?: string; end_date?: string;
    };
    if (!destination || !start_date || !end_date) throw BadRequest('destination, start_date, end_date required');

    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: request.userId,
        title: `${destination} on ${start_date}`,
        destination,
        start_date,
        end_date,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !data) throw BadRequest(error?.message ?? 'Insert failed');
    return reply.status(201).send(data);
  });

  // PATCH /trips/:id
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/trips/:id',
    async (request) => {
      const allowed = ['title', 'destination', 'start_date', 'end_date'];
      const updates = Object.fromEntries(
        Object.entries(request.body).filter(([k]) => allowed.includes(k)),
      );
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', request.params.id)
        .eq('user_id', request.userId)
        .select()
        .single();
      if (error || !data) throw NotFound();
      return data;
    },
  );

  // DELETE /trips/:id
  fastify.delete<{ Params: { id: string } }>('/trips/:id', async (request, reply) => {
    await supabase.from('trips').delete().eq('id', request.params.id).eq('user_id', request.userId);
    return reply.status(204).send();
  });

  // GET /trip-items?trip_id=...
  fastify.get<{ Querystring: { trip_id?: string } }>('/trip-items', async (request) => {
    let q = supabase.from('trip_items').select('*').eq('user_id', request.userId);
    if (request.query.trip_id) q = q.eq('trip_id', request.query.trip_id);
    const { data } = await q.order('created_at', { ascending: false });
    return data ?? [];
  });

  // PATCH /trip-items/:id
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/trip-items/:id',
    async (request) => {
      const allowed = ['status', 'document_url', 'start_date', 'end_date'];
      const updates = Object.fromEntries(
        Object.entries(request.body).filter(([k]) => allowed.includes(k)),
      );
      const { data, error } = await supabase
        .from('trip_items')
        .update(updates)
        .eq('id', request.params.id)
        .eq('user_id', request.userId)
        .select()
        .single();
      if (error || !data) throw NotFound();
      return data;
    },
  );
};

export default tripsRoutes;
