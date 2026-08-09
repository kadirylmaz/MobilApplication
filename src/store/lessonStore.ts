// =============================================================================
// Ders Defteri — Lesson Zustand Store
// =============================================================================

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { LessonRow, LessonStatus } from '../types/database';
import type { AsyncStatus, LessonFormValues } from '../types/index';

interface LessonState {
  lessons: LessonRow[];
  status: AsyncStatus;
  error: string | null;
}

interface LessonActions {
  fetchLessonsForStudent: (studentId: string) => Promise<void>;
  fetchLessonsInRange: (startISO: string, endISO: string) => Promise<void>;
  addLesson: (values: LessonFormValues) => Promise<void>;
  updateLesson: (id: string, values: Partial<LessonFormValues>) => Promise<void>;
  updateLessonStatus: (id: string, status: LessonStatus) => Promise<void>;
  compensateLesson: (originalLessonId: string, values: LessonFormValues) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  getLessonsForStudent: (studentId: string) => LessonRow[];
}

type LessonStore = LessonState & LessonActions;

export const useLessonStore = create<LessonStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  lessons: [],
  status: 'idle',
  error: null,

  // ── Selector ───────────────────────────────────────────────────────────────

  getLessonsForStudent: (studentId: string): LessonRow[] => {
    return get().lessons.filter((lesson) => lesson.student_id === studentId);
  },

  // ── Actions ────────────────────────────────────────────────────────────────

  fetchLessonsForStudent: async (studentId: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', studentId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      const fetched = data ?? [];

      // Replace existing lessons for this student and keep others
      set((state) => {
        const others = state.lessons.filter((l) => l.student_id !== studentId);
        return { lessons: [...others, ...fetched], status: 'success' };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Dersler yüklenemedi';
      set({ status: 'error', error: message });
    }
  },

  fetchLessonsInRange: async (startISO: string, endISO: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .gte('scheduled_at', startISO)
        .lt('scheduled_at', endISO)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      const fetched: LessonRow[] = data ?? [];
      const fetchedIds = new Set(fetched.map((l) => l.id));

      set((state) => {
        const others = state.lessons.filter((l) => !fetchedIds.has(l.id));
        return { lessons: [...others, ...fetched], status: 'success' };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Dersler yüklenemedi';
      set({ status: 'error', error: message });
    }
  },

  addLesson: async (values: LessonFormValues) => {
    set({ status: 'loading', error: null });
    try {
      // Resolve current teacher_id via RPC
      const { data: teacherId, error: rpcError } = await supabase.rpc('get_teacher_id');
      if (rpcError) throw rpcError;

      // Merge date + time into an ISO 8601 timestamp
      const scheduled_at = `${values.scheduled_date}T${values.scheduled_time}:00`;

      const { data, error } = await supabase
        .from('lessons')
        .insert({
          teacher_id: teacherId as string,
          student_id: values.student_id,
          scheduled_at,
          duration_minutes: values.duration_minutes,
          topic: values.topic || null,
          notes: values.notes || null,
          status: values.status,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        lessons: [data, ...state.lessons],
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ders eklenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  updateLesson: async (id: string, values: Partial<LessonFormValues>) => {
    set({ status: 'loading', error: null });
    try {
      const updatePayload: Record<string, unknown> = {};

      if (values.scheduled_date !== undefined || values.scheduled_time !== undefined) {
        const current = get().lessons.find((l) => l.id === id);
        const currentDate = current ? current.scheduled_at.slice(0, 10) : '';
        const currentTime = current ? current.scheduled_at.slice(11, 16) : '';
        const date = values.scheduled_date ?? currentDate;
        const time = values.scheduled_time ?? currentTime;
        updatePayload.scheduled_at = `${date}T${time}:00`;
      }
      if (values.duration_minutes !== undefined) updatePayload.duration_minutes = values.duration_minutes;
      if (values.topic !== undefined) updatePayload.topic = values.topic || null;
      if (values.notes !== undefined) updatePayload.notes = values.notes || null;
      if (values.status !== undefined) updatePayload.status = values.status;

      const { data, error } = await supabase
        .from('lessons')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        lessons: state.lessons.map((l) => (l.id === id ? data : l)),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ders güncellenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  updateLessonStatus: async (id: string, status: LessonStatus) => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        lessons: state.lessons.map((l) => (l.id === id ? data : l)),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ders durumu güncellenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  compensateLesson: async (originalLessonId: string, values: LessonFormValues) => {
    set({ status: 'loading', error: null });
    try {
      const { data: teacherId, error: rpcError } = await supabase.rpc('get_teacher_id');
      if (rpcError) throw rpcError;

      const { data: cancelledLesson, error: cancelError } = await supabase
        .from('lessons')
        .update({ status: 'cancelled' })
        .eq('id', originalLessonId)
        .select()
        .single();

      if (cancelError) throw cancelError;

      const scheduled_at = `${values.scheduled_date}T${values.scheduled_time}:00`;

      const { data: newLesson, error: insertError } = await supabase
        .from('lessons')
        .insert({
          teacher_id: teacherId as string,
          student_id: values.student_id,
          scheduled_at,
          duration_minutes: values.duration_minutes,
          topic: values.topic || null,
          notes: values.notes || null,
          status: 'compensated',
          compensates_lesson_id: originalLessonId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      set((state) => ({
        lessons: [
          newLesson,
          ...state.lessons.map((l) => (l.id === originalLessonId ? cancelledLesson : l)),
        ],
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Telafi dersi oluşturulamadı';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  deleteLesson: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;

      set((state) => ({
        lessons: state.lessons.filter((l) => l.id !== id),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ders silinemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },
}));
