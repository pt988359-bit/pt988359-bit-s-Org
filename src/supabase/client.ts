import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import { LoggerService } from '../core/services/LoggerService';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const url = supabaseConfig.supabaseUrl || 'https://placeholder.supabase.co';
    const key = supabaseConfig.supabaseAnonKey || 'placeholder-anon-key';

    if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
      LoggerService.warn(
        'Supabase',
        'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. Using placeholder client.'
      );
    }

    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClient;
}

export const supabase: SupabaseClient = getSupabaseClient();
