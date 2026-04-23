import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// Service-role client — bypasses RLS; only for use in backend services.
// Never expose this client to the frontend.
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
