// =============================================================================
// Ders Defteri — Group (Sınıfım ve Gruplarım) Zustand Store
// =============================================================================

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { GroupRow, StudentRow } from '../types/database';
import type { AsyncStatus, GroupFormValues } from '../types/index';

interface GroupState {
  groups: GroupRow[];
  members: Record<string, StudentRow[]>; // group_id -> öğrenci listesi
  status: AsyncStatus;
  error: string | null;
}

interface GroupActions {
  fetchGroups: () => Promise<void>;
  createGroup: (values: GroupFormValues) => Promise<void>;
  updateGroup: (id: string, values: Partial<GroupFormValues>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  fetchMembers: (groupId: string) => Promise<void>;
  addMember: (groupId: string, studentId: string) => Promise<void>;
  removeMember: (groupId: string, studentId: string) => Promise<void>;
}

type GroupStore = GroupState & GroupActions;

export const useGroupStore = create<GroupStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  groups: [],
  members: {},
  status: 'idle',
  error: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  fetchGroups: async () => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      set({ groups: data ?? [], status: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gruplar yüklenemedi';
      set({ status: 'error', error: message });
    }
  },

  createGroup: async (values: GroupFormValues) => {
    set({ status: 'loading', error: null });
    try {
      const { data: teacherId, error: rpcError } = await supabase.rpc('get_teacher_id');
      if (rpcError) throw rpcError;

      const { data, error } = await supabase
        .from('groups')
        .insert({
          teacher_id: teacherId as string,
          name: values.name,
          description: values.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        groups: [...state.groups, data].sort((a, b) => a.name.localeCompare(b.name)),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Grup eklenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  updateGroup: async (id: string, values: Partial<GroupFormValues>) => {
    set({ status: 'loading', error: null });
    try {
      const updatePayload: Record<string, unknown> = {};
      if (values.name !== undefined) updatePayload.name = values.name;
      if (values.description !== undefined) updatePayload.description = values.description || null;

      const { data, error } = await supabase
        .from('groups')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        groups: state.groups
          .map((g) => (g.id === id ? data : g))
          .sort((a, b) => a.name.localeCompare(b.name)),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Grup güncellenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  deleteGroup: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) throw error;

      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Grup silinemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  fetchMembers: async (groupId: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('students(*)')
        .eq('group_id', groupId);

      if (error) throw error;

      const students = (data ?? [])
        .map((row) => (row as unknown as { students: StudentRow }).students)
        .filter(Boolean)
        .sort((a, b) => a.full_name.localeCompare(b.full_name));

      set((state) => ({
        members: { ...state.members, [groupId]: students },
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Grup üyeleri yüklenemedi';
      set({ status: 'error', error: message });
    }
  },

  addMember: async (groupId: string, studentId: string) => {
    set({ status: 'loading', error: null });
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, student_id: studentId });

      if (error) throw error;

      await get().fetchMembers(groupId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Öğrenci gruba eklenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  removeMember: async (groupId: string, studentId: string) => {
    set({ status: 'loading', error: null });
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('student_id', studentId);

      if (error) throw error;

      set((state) => ({
        members: {
          ...state.members,
          [groupId]: (state.members[groupId] ?? []).filter((s) => s.id !== studentId),
        },
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Öğrenci gruptan çıkarılamadı';
      set({ status: 'error', error: message });
      throw err;
    }
  },
}));
