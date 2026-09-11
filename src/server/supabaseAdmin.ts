/**
 * Enterprise Architecture - Production Server-Side Supabase Admin SDK
 * Step 6 Migration (Isolated Node.js Backend Client)
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY from process.env for elevated server operations
 * (e.g. background cron jobs, secure batch sync, admin maintenance).
 * Completely decoupled and isolated from firebaseAdmin.ts.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Returns true if server environment variables for Supabase are configured.
 */
export function isSupabaseAdminConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && serviceKey);
}

/**
 * Lazily initializes and returns the server-side Supabase Admin Client.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security for server tasks.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  // Prefer service role key for full administrative bypass; fallback to anon key for diagnostics if service role is not set
  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '[SupabaseAdmin] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in process.env. Server admin operations will be disabled or dry-run.'
    );
    return null;
  }

  try {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('[SupabaseAdmin] Server-side Supabase Admin client initialized successfully.');
    return supabaseAdminInstance;
  } catch (error: any) {
    console.error('[SupabaseAdmin] Failed to initialize Supabase Admin client:', error?.message || error);
    return null;
  }
}
