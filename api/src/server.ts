import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from './config.js';
import authPlugin from './lib/auth.js';
import { handleError } from './lib/errors.js';

// Routes
import tripsRoutes from './api/routes/trips.js';
import eventsRoutes from './api/routes/events.js';
import remindersRoutes from './api/routes/reminders.js';
import receiptsRoutes from './api/routes/receipts.js';
import usersRoutes from './api/routes/users.js';

// Webhooks (no auth)
import whatsappRoutes from './api/webhooks/whatsapp.js';
import iosNotesRoutes from './api/webhooks/ios-notes.js';

const fastify = Fastify({ logger: true });

// Security headers
await fastify.register(helmet);

// CORS — restrict to frontend origin in prod
await fastify.register(cors, {
  origin: config.NODE_ENV === 'production' ? (process.env['FRONTEND_URL'] ?? '*') : true,
  credentials: true,
});

// Unauthenticated webhook routes
await fastify.register(whatsappRoutes);
await fastify.register(iosNotesRoutes);

// Authenticated API routes
await fastify.register(async (instance) => {
  await instance.register(authPlugin);
  instance.register(tripsRoutes);
  instance.register(eventsRoutes);
  instance.register(remindersRoutes);
  instance.register(receiptsRoutes);
  instance.register(usersRoutes);
});

// Global error handler
fastify.setErrorHandler((err, _request, reply) => {
  handleError(err as Error, reply);
});

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

try {
  await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
