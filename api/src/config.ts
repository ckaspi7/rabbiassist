import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().min(1),

  // Google OAuth (per-app credentials; per-user tokens stored in DB)
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // WhatsApp Business API
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1),

  // Pushover
  PUSHOVER_APP_TOKEN: z.string().min(1),
  PUSHOVER_USER_KEY: z.string().min(1),
  PUSHOVER_DEVICE: z.string().default('iphone-cem'),

  // Database (for pg-boss; uses the Supabase Postgres connection string)
  DATABASE_URL: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
