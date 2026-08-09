// =============================================================================
// Ders Defteri — Payment Zustand Store
// =============================================================================

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { PaymentRow, PaymentStatus } from '../types/database';
import type { AsyncStatus, PaymentFormValues } from '../types/index';

interface PaymentState {
  payments: PaymentRow[];
  status: AsyncStatus;
  error: string | null;
}

interface PaymentActions {
  fetchPaymentsForStudent: (studentId: string) => Promise<void>;
  fetchPaymentsInRange: (startDate: string, endDate: string) => Promise<void>;
  addPayment: (values: PaymentFormValues) => Promise<void>;
  updatePayment: (id: string, values: Partial<PaymentFormValues>) => Promise<void>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  getPaymentsForStudent: (studentId: string) => PaymentRow[];
}

type PaymentStore = PaymentState & PaymentActions;

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  payments: [],
  status: 'idle',
  error: null,

  // ── Selector ───────────────────────────────────────────────────────────────

  getPaymentsForStudent: (studentId: string): PaymentRow[] => {
    return get().payments.filter((payment) => payment.student_id === studentId);
  },

  // ── Actions ────────────────────────────────────────────────────────────────

  fetchPaymentsForStudent: async (studentId: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('period_start', { ascending: false });

      if (error) throw error;

      const fetched = data ?? [];

      set((state) => {
        const others = state.payments.filter((p) => p.student_id !== studentId);
        return { payments: [...others, ...fetched], status: 'success' };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ödemeler yüklenemedi';
      set({ status: 'error', error: message });
    }
  },

  fetchPaymentsInRange: async (startDate: string, endDate: string) => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .gte('period_start', startDate)
        .lte('period_start', endDate)
        .order('period_start', { ascending: false });

      if (error) throw error;

      const fetched: PaymentRow[] = data ?? [];
      const fetchedIds = new Set(fetched.map((p) => p.id));

      set((state) => {
        const others = state.payments.filter((p) => !fetchedIds.has(p.id));
        return { payments: [...others, ...fetched], status: 'success' };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ödemeler yüklenemedi';
      set({ status: 'error', error: message });
    }
  },

  addPayment: async (values: PaymentFormValues) => {
    set({ status: 'loading', error: null });
    try {
      const { data: teacherId, error: rpcError } = await supabase.rpc('get_teacher_id');
      if (rpcError) throw rpcError;

      const { data, error } = await supabase
        .from('payments')
        .insert({
          teacher_id: teacherId as string,
          student_id: values.student_id,
          amount: parseFloat(values.amount),
          payment_date: values.payment_date || null,
          period_start: values.period_start,
          period_end: values.period_end,
          status: values.status,
          notes: values.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        payments: [data, ...state.payments],
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ödeme eklenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  updatePayment: async (id: string, values: Partial<PaymentFormValues>) => {
    set({ status: 'loading', error: null });
    try {
      const updatePayload: Record<string, unknown> = {};

      if (values.amount !== undefined) updatePayload.amount = parseFloat(values.amount);
      if (values.payment_date !== undefined) updatePayload.payment_date = values.payment_date || null;
      if (values.period_start !== undefined) updatePayload.period_start = values.period_start;
      if (values.period_end !== undefined) updatePayload.period_end = values.period_end;
      if (values.status !== undefined) updatePayload.status = values.status;
      if (values.notes !== undefined) updatePayload.notes = values.notes || null;

      const { data, error } = await supabase
        .from('payments')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        payments: state.payments.map((p) => (p.id === id ? data : p)),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ödeme güncellenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  updatePaymentStatus: async (id: string, status: PaymentStatus) => {
    set({ status: 'loading', error: null });
    try {
      const updatePayload: Record<string, unknown> = { status };
      if (status === 'paid') {
        const current = get().payments.find((p) => p.id === id);
        if (!current?.payment_date) {
          updatePayload.payment_date = new Date().toISOString().slice(0, 10);
        }
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        payments: state.payments.map((p) => (p.id === id ? data : p)),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ödeme durumu güncellenemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  deletePayment: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;

      set((state) => ({
        payments: state.payments.filter((p) => p.id !== id),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ödeme silinemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },
}));
