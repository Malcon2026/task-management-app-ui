import { createClient } from '@supabase/supabase-js';

const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  envUrl.startsWith('http') &&
  !envUrl.includes('YOUR_SUPABASE_URL') &&
  !envKey.includes('YOUR_SUPABASE_ANON_KEY')
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase credentials not configured in .env. Application running in local 3-account mode.'
  );
}

const validUrl = isSupabaseConfigured ? envUrl : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured ? envKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE20DAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';

export const supabase = createClient(validUrl, validKey);
