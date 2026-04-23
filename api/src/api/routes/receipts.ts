import { FastifyPluginAsync } from 'fastify';
import { supabase } from '../../db/client.js';

const receiptsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /receipts
  fastify.get<{ Querystring: { category?: string; vendor?: string } }>(
    '/receipts',
    async (request) => {
      let q = supabase
        .from('receipts')
        .select('*')
        .eq('user_id', request.userId)
        .order('expense_date', { ascending: false });

      if (request.query.category) q = q.eq('category', request.query.category);
      if (request.query.vendor) q = q.ilike('vendor', `%${request.query.vendor}%`);

      const { data } = await q;
      return data ?? [];
    },
  );
};

export default receiptsRoutes;
