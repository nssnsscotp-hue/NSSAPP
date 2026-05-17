/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Check your environment variables.");
}

if (supabaseAnonKey?.startsWith('sb_publishable_')) {
  // Respect user provided key format
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
