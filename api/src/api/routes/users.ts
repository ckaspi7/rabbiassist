import { FastifyPluginAsync } from 'fastify';
import { supabase } from '../../db/client.js';
import { NotFound } from '../../lib/errors.js';

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /users/me
  fastify.get('/users/me', async (request) => {
    const { data } = await supabase
      .from('users')
      .select('id, email, phone_number, created_at')
      .eq('id', request.userId)
      .single();
    if (!data) throw NotFound();
    return data;
  });
};

export default usersRoutes;
