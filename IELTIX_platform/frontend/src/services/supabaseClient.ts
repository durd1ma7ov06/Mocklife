import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://jjayizhwxnrwbifdwxxk.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_4ZhdraO5fnOFnsWS4LNnFg_o3MJZnRF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
