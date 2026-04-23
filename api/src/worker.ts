import PgBoss from 'pg-boss';
import { config } from './config.js';
import { registerJobs } from './jobs/index.js';

const boss = new PgBoss(config.DATABASE_URL);

boss.on('error', (err) => console.error('[pg-boss] error', err));

await boss.start();
console.log('[worker] pg-boss started');

await registerJobs(boss);
console.log('[worker] Ready — listening for jobs');

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`[worker] ${signal} received — stopping pg-boss`);
  await boss.stop();
  process.exit(0);
};

process.on('SIGTERM', () => { shutdown('SIGTERM').catch(console.error); });
process.on('SIGINT', () => { shutdown('SIGINT').catch(console.error); });
