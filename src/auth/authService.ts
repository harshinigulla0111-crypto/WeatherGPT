import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

export class AuthService {
  /**
   * Triggers Google OAuth authentication via Supabase Auth
   */
  public static async signInWithGoogle(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        error: new Error('Supabase project credentials are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.')
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  /**
   * Sign up with email and password
   */
  public static async signUpWithEmail(email: string, password: string): Promise<{ data: any; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: new Error('Supabase project credentials are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.')
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      return { data, error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  /**
   * Sign in with email and password
   */
  public static async signInWithPassword(email: string, password: string): Promise<{ data: any; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: new Error('Supabase project credentials are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.')
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  /**
   * Resend signup confirmation email
   */
  public static async resendConfirmationEmail(email: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase project credentials are missing.') };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  /**
   * Signs out the current session
   */
  public static async signOut(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }
}
