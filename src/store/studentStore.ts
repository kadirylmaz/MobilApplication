// =============================================================================
// Ders Defteri — Student Zustand Store
// =============================================================================

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { StudentRow } from '../types/database';
import type { AsyncStatus, StudentFormValues } from '../types/index';

interface StudentFiltersState {
  search: string;
  is_active: boolean | null;
}

interface StudentState {
  students: StudentRow[];
  status: AsyncStatus;
  error: string | null;
  filters: StudentFiltersState;
}

interface StudentActions {
  fetchStudents: () => Promise<void>;
  addStudent: (values: StudentFormValues) => Promise<void>;
  updateStudent: (id: string, values: Partial<StudentFormValues>) => Promise<void>;
  setFilters: (partial: Partial<StudentFiltersState>) => void;
  filteredStudents: () => StudentRow[];
}

type StudentStore = StudentState & StudentActions;

export const useStudentStore = create<StudentStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  students: [],
  status: 'idle',
  error: null,
  filters: {
    search: '',
    is_active: true,
  },

  // ── Computed getter ────────────────────────────────────────────────────────

  filteredStudents: () => {
    const { students, filters } = get();
    const searchLower = filters.search.toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        searchLower === '' ||
        student.full_name.toLowerCase().includes(searchLower);

      const matchesActive =
        filters.is_active === null || student.is_active === filters.is_active;

      return matchesSearch && matchesActive;
    });
  },

  // ── Actions ────────────────────────────────────────────────────────────────

  fetchStudents: async () => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      set({ students: data ?? [], status: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Öğrenciler yüklenemedi';
      set({ status: 'error', error: message });
    }
  },

  addStudent: async (values: StudentFormValues) => {
    set({ status: 'loading', error: null });
    try {
      // Resolve current teacher_id via RPC
      const { data: teacherId, error: rpcError } = await supabase.rpc('get_teacher_id');
      if (rpcError) throw rpcError;

      const { data, error } = await supabase
        .from('students')
        .insert({
          teacher_id: teacherId as string,
          full_name: values.full_name,
          phone: values.phone || null,
          parent_name: values.parent_name || null,
          parent_phone: values.parent_phone || null,
          grade: values.grade || null,
          subject: values.subject || null,
          notes: values.notes || null,
          is_active: values.is_active,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        students: [...state.students, data].sort((a, b) =>
          a.full_name.localeCompare(b.full_name),
        ),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Öğrenci eklenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  updateStudent: async (id: string, values: Partial<StudentFormValues>) => {
    set({ status: 'loading', error: null });
    try {
      const updatePayload: Record<string, unknown> = {};
      if (values.full_name !== undefined) updatePayload.full_name = values.full_name;
      if (values.phone !== undefined) updatePayload.phone = values.phone || null;
      if (values.parent_name !== undefined) updatePayload.parent_name = values.parent_name || null;
      if (values.parent_phone !== undefined) updatePayload.parent_phone = values.parent_phone || null;
      if (values.grade !== undefined) updatePayload.grade = values.grade || null;
      if (values.subject !== undefined) updatePayload.subject = values.subject || null;
      if (values.notes !== undefined) updatePayload.notes = values.notes || null;
      if (values.is_active !== undefined) updatePayload.is_active = values.is_active;

      const { data, error } = await supabase
        .from('students')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        students: state.students
          .map((s) => (s.id === id ? data : s))
          .sort((a, b) => a.full_name.localeCompare(b.full_name)),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Öğrenci güncellenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  setFilters: (partial: Partial<StudentFiltersState>) => {
    set((state) => ({
      filters: { ...state.filters, ...partial },
    }));
  },
}));
