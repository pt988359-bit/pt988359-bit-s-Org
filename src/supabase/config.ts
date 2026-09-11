export interface SupabaseAppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key] && process.env[key].trim() !== '') {
    return process.env[key].trim();
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      const val = import.meta.env[key];
      if (val && typeof val === 'string' && val.trim() !== '') {
        return val.trim();
      }
    }
  } catch {
    // Environment without import.meta
  }
  return undefined;
};

export const supabaseConfig: SupabaseAppConfig = {
  supabaseUrl: getEnv('VITE_SUPABASE_URL') || '',
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY') || '',
};
