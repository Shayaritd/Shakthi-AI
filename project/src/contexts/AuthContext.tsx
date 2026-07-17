import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isOnboarded: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchingUserId = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingUserId.current === userId) return;
    fetchingUserId.current = userId;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, athlete_profiles!user_id(id), mentor_profiles!user_id(id)')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data as Profile | null);
        let onboarded = false;
        if (data.role === 'ATHLETE') {
          onboarded = Array.isArray(data.athlete_profiles) 
            ? data.athlete_profiles.length > 0 
            : !!data.athlete_profiles;
        } else if (data.role === 'MENTOR') {
          onboarded = Array.isArray(data.mentor_profiles) 
            ? data.mentor_profiles.length > 0 
            : !!data.mentor_profiles;
        } else if (data.role === 'GUARDIAN') {
          onboarded = !!data.phone;
        } else {
          onboarded = true;
        }
        setIsOnboarded(onboarded);
      } else {
        setProfile(null);
        setIsOnboarded(false);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      if (fetchingUserId.current === userId) {
        fetchingUserId.current = null;
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!active) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!active) return;
        setLoading(true);
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
          setIsOnboarded(false);
        }
        setLoading(false);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string,
    phone?: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone: phone?.trim() || null,
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      // No manual fetchProfile call here as onAuthStateChange handles it.
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsOnboarded(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    isOnboarded,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
