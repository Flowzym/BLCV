import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a proper fallback client that has the expected methods but returns empty data
const createFallbackClient = () => ({
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null })
  }
});

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : createFallbackClient();


export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
