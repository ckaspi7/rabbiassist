import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { Unauthorized } from './errors.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const supabaseAuth = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

  fastify.decorateRequest('userId', '');

  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw Unauthorized('Missing or invalid Authorization header');
    }

    const token = header.slice(7);
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) {
      throw Unauthorized('Invalid or expired token');
    }

    request.userId = data.user.id;
  });
};

export default fp(authPlugin, { name: 'auth' });
