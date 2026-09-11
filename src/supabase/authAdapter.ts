/**
 * Enterprise Architecture - Production Supabase Auth Adapter
 * Step Auth Migration (Isolated)
 *
 * Wraps Supabase Auth client functions with clean TypeScript signatures.
 * Kept completely isolated from active live Firebase Auth components.
 */

import { supabase } from './client';
import {
  Session,
  User,
  AuthResponse,
  AuthTokenResponsePassword,
  AuthChangeEvent,
  Subscription,
} from '@supabase/supabase-js';
import { LoggerService } from '../core/services/LoggerService';

export interface AuthResult<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  options?: { data?: Record<string, any> }
): Promise<AuthResult<AuthResponse['data']>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      LoggerService.warn('SupabaseAuthAdapter', `signUpWithEmail failed for ${email}:`, error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    LoggerService.warn('SupabaseAuthAdapter', `signUpWithEmail unexpected error:`, err);
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult<AuthTokenResponsePassword['data']>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      LoggerService.warn('SupabaseAuthAdapter', `signInWithEmail failed for ${email}:`, error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    LoggerService.warn('SupabaseAuthAdapter', `signInWithEmail unexpected error:`, err);
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Sign out the currently authenticated user
 */
export async function signOut(): Promise<AuthResult<void>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      LoggerService.warn('SupabaseAuthAdapter', `signOut failed:`, error.message);
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (err: any) {
    LoggerService.warn('SupabaseAuthAdapter', `signOut unexpected error:`, err);
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Retrieve the current active session
 */
export async function getCurrentSession(): Promise<AuthResult<Session | null>> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      LoggerService.warn('SupabaseAuthAdapter', `getCurrentSession failed:`, error.message);
      return { data: null, error };
    }

    return { data: data.session, error: null };
  } catch (err: any) {
    LoggerService.warn('SupabaseAuthAdapter', `getCurrentSession unexpected error:`, err);
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Retrieve the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResult<User | null>> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error };
    }

    return { data: data.user, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Subscribe to Supabase Auth state changes
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return {
    unsubscribe: () => {
      data.subscription.unsubscribe();
    },
  };
}

export const supabaseAuthAdapter = {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange,
};
