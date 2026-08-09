// =============================================================================
// Ders Defteri — Auth Zustand Store
// =============================================================================

import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase, getTeacherProfile } from '../lib/supabase';
import type { TeacherRow } from '../types/database';
import type { AsyncStatus } from '../types/index';

interface AuthState {
  user: User | null;
  teacher: TeacherRow | null;
  status: AsyncStatus;
  error: string | null;
}

interface AuthActions {
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateTeacher: (values: { full_name: string; phone?: string }) => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  user: null,
  teacher: null,
  status: 'idle',
  error: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  initialize: async () => {
    set({ status: 'loading', error: null });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user ?? null;
      const teacher = user ? await getTeacherProfile() : null;

      set({ user, teacher, status: 'success' });

      // Subscribe to future auth state changes
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        const nextUser = newSession?.user ?? null;
        const nextTeacher = nextUser ? await getTeacherProfile() : null;
        set({ user: nextUser, teacher: nextTeacher });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Başlatma hatası';
      set({ status: 'error', error: message });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;

      const user = data.user;
      const teacher = user ? await getTeacherProfile() : null;
      set({ user, teacher, status: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Giriş başarısız';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });
      if (error) throw error;

      const user = data.user;
      const teacher = user ? await getTeacherProfile() : null;
      set({ user, teacher, status: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kayıt başarısız';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  signOut: async () => {
    set({ status: 'loading', error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, teacher: null, status: 'idle' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Çıkış başarısız';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  updateTeacher: async (values: { full_name: string; phone?: string }) => {
    set({ status: 'loading', error: null });
    try {
      const current = useAuthStore.getState().teacher;
      if (!current) throw new Error('Öğretmen profili bulunamadı');

      const { data, error } = await supabase
        .from('teachers')
        .update({
          full_name: values.full_name,
          phone: values.phone || null,
        })
        .eq('id', current.id)
        .select()
        .single();

      if (error) throw error;

      set({ teacher: data, status: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profil güncellenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
