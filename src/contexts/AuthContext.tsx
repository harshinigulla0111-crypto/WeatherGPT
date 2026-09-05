import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SupportedLanguage } from '../services/i18nService';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { ProfileService } from '../services/profileService';
import type { UserProfileData } from '../services/profileService';
import { AuthService } from '../auth/authService';

export type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  primaryCity: string;
  language: SupportedLanguage;
  notificationsEnabled: boolean;
  voiceEnabled: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: any | null;
  profile: UserProfileData | null;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'signup' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'signup' | 'forgot') => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ data: any; error: Error | null }>;
  signInWithPassword: (email: string, pass: string) => Promise<{ data: any; error: Error | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  updatePreferences: (prefs: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('LOADING');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const handleAuthUser = async (authUser: any) => {
    setSupabaseUser(authUser);
    const dbProfile = await ProfileService.getOrCreateProfile(authUser);

    const formattedUser: UserProfile = {
      id: authUser.id,
      name:
        dbProfile?.full_name ||
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'WeatherGPT User',
      email: authUser.email || '',
      avatarUrl:
        dbProfile?.avatar_url ||
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      primaryCity: 'Vijayawada',
      language: 'en',
      notificationsEnabled: true,
      voiceEnabled: true
    };

    setProfile(dbProfile);
    setUser(formattedUser);
    setAuthStatus('AUTHENTICATED');
  };

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setAuthStatus('UNAUTHENTICATED');
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        handleAuthUser(session.user);
      } else {
        setAuthStatus('UNAUTHENTICATED');
      }
    }).catch(() => {
      if (isMounted) setAuthStatus('UNAUTHENTICATED');
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        handleAuthUser(session.user);
      } else {
        setSupabaseUser(null);
        setProfile(null);
        setUser(null);
        setAuthStatus('UNAUTHENTICATED');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    return AuthService.signInWithGoogle();
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    return AuthService.signUpWithEmail(email, pass);
  };

  const signInWithPassword = async (email: string, pass: string) => {
    return AuthService.signInWithPassword(email, pass);
  };

  const resendConfirmationEmail = async (email: string) => {
    return AuthService.resendConfirmationEmail(email);
  };

  const logout = async () => {
    await AuthService.signOut();
    setSupabaseUser(null);
    setProfile(null);
    setUser(null);
    setAuthStatus('UNAUTHENTICATED');
    setIsAuthModalOpen(false);
  };

  const updatePreferences = (prefs: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...prefs });
      if (prefs.language) {
        setLanguage(prefs.language);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        profile,
        authStatus,
        isAuthenticated: authStatus === 'AUTHENTICATED',
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        signInWithGoogle,
        signUpWithEmail,
        signInWithPassword,
        resendConfirmationEmail,
        logout,
        language,
        setLanguage,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
