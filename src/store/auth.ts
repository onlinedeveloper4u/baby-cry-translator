import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../config/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<{ error: any }>;
  continueAsGuest: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isGuest: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.user) {
      set({ user: data.user, session: data.session, loading: false });
    } else {
      set({ loading: false });
    }
    
    return { error };
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    set({ loading: false });
    return { error };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    // Do not remove the key entirely; keep the key present and set to 'false'
    // so we avoid deleting storage keys used for other app data.
    try {
      await AsyncStorage.setItem('isGuest', 'false');
    } catch {
      // ignore storage write errors
    }
    set({ user: null, session: null, loading: false, isGuest: false });
  },

  verifyEmail: async (email: string, token: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    
    if (data.user) {
      set({ user: data.user, session: data.session, loading: false });
    } else {
      set({ loading: false });
    }
    
    return { error };
  },

  initialize: async () => {
    set({ loading: true });
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    const guestFlag = await AsyncStorage.getItem('isGuest');
    set({ session, user: session?.user ?? null, isGuest: guestFlag === 'true', loading: false });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });
  },

  continueAsGuest: async () => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInAnonymously();
    // Even if there's an error, still mark guest so user can proceed offline-ish
    await AsyncStorage.setItem('isGuest', 'true');
    set({ isGuest: true, user: data?.user ?? null, session: data?.session ?? null, loading: false });
    if (error) {
      // No throw; the UI can continue in guest mode without a server session
      // Optionally log error to a monitoring tool here
      return;
    }
  },
}));
