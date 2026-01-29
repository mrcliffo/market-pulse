/**
 * Client-side Supabase client for browser use
 * Uses VITE_ prefixed env vars for client-side access
 */

import { createClient } from '@supabase/supabase-js';

// Read from Vite environment variables (set in Vercel)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

/**
 * Get or create Supabase client for browser
 * Returns null if Supabase is not configured
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  // Return null if not configured - allows graceful degradation
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabaseClient;
}

export default getSupabaseClient;
