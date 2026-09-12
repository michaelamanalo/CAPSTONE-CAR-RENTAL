import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim();
export const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();
const isSecretKey = supabaseKey?.startsWith('sb_secret_');
const hasPlaceholder = [supabaseUrl, supabaseKey].some((value) => (
  !value || value.includes('your-project-ref') || value.includes('your-publishable-or-anon-key')
));

export const isSupabaseConfigured = Boolean(
  !hasPlaceholder && !isSecretKey && /^https:\/\//.test(supabaseUrl),
);

export const supabaseConfigMessage = !supabaseUrl || !supabaseKey
  ? 'Set both Supabase environment variables in .env.local.'
  : isSecretKey
    ? 'Secret keys cannot be used in a browser. Use a Supabase publishable key or legacy anon keyZ.'
  : hasPlaceholder
    ? 'Replace the placeholder Supabase values in .env.local with your project values.'
    : 'REACT_APP_SUPABASE_URL must be an HTTPS Supabase project URL.';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;