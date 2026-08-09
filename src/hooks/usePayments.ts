// =============================================================================
// Ders Defteri — usePayments Hook
// =============================================================================

import { usePaymentStore } from '../store/paymentStore';

export function usePayments() {
  const payments = usePaymentStore((s) => s.payments);
  const status = usePaymentStore((s) => s.status);
  const error = usePaymentStore((s) => s.error);
  const fetchPaymentsForStudent = usePaymentStore((s) => s.fetchPaymentsForStudent);
  const fetchPaymentsInRange = usePaymentStore((s) => s.fetchPaymentsInRange);
  const addPayment = usePaymentStore((s) => s.addPayment);
  const updatePayment = usePaymentStore((s) => s.updatePayment);
  const updatePaymentStatus = usePaymentStore((s) => s.updatePaymentStatus);
  const deletePayment = usePaymentStore((s) => s.deletePayment);
  const getPaymentsForStudent = usePaymentStore((s) => s.getPaymentsForStudent);

  return {
    payments,
    status,
    error,
    fetchPaymentsForStudent,
    fetchPaymentsInRange,
    addPayment,
    updatePayment,
    updatePaymentStatus,
    deletePayment,
    getPaymentsForStudent,
    isLoading: status === 'loading',
  };
}
