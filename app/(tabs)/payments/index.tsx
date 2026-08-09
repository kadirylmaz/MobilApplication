// =============================================================================
// Ders Defteri — Payments Screen
// =============================================================================

import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { startOfMonth, endOfMonth } from 'date-fns';
import { usePayments } from '../../../src/hooks/usePayments';
import { useStudents } from '../../../src/hooks/useStudents';
import { PaymentCard } from '../../../src/components/payment/PaymentCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import type { PaymentRow, PaymentStatus } from '../../../src/types/database';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const ERROR_COLOR = '#EF4444';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';

type StatusFilter = 'all' | PaymentStatus;

function isOverdue(payment: PaymentRow): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return payment.status === 'pending' && payment.period_end < today;
}

function formatAmount(amount: number): string {
  return `${amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺`;
}

export default function PaymentsScreen() {
  const router = useRouter();
  const { payments, fetchPaymentsInRange, isLoading } = usePayments();
  const { students, fetchStudents } = useStudents();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      const rangeStart = startOfMonth(now).toISOString().slice(0, 10);
      const rangeEnd = endOfMonth(now).toISOString().slice(0, 10);
      fetchPaymentsInRange(rangeStart, rangeEnd);
      fetchStudents();
    }, [fetchPaymentsInRange, fetchStudents]),
  );

  const studentNameById = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => map.set(s.id, s.full_name));
    return map;
  }, [students]);

  const summary = useMemo(() => {
    let totalRevenue = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;

    payments.forEach((payment) => {
      if (payment.status === 'paid') {
        totalRevenue += payment.amount;
      } else if (isOverdue(payment) || payment.status === 'overdue') {
        overdueAmount += payment.amount;
      } else if (payment.status === 'pending') {
        pendingAmount += payment.amount;
      }
    });

    return { totalRevenue, pendingAmount, overdueAmount };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const sorted = [...payments].sort((a, b) => b.period_start.localeCompare(a.period_start));
    if (statusFilter === 'all') return sorted;
    if (statusFilter === 'overdue') return sorted.filter((p) => isOverdue(p) || p.status === 'overdue');
    return sorted.filter((p) => p.status === statusFilter && !isOverdue(p));
  }, [payments, statusFilter]);

  function handlePaymentPress(payment: PaymentRow) {
    router.push(`/(tabs)/payments/${payment.id}`);
  }

  function handleAddPayment() {
    router.push('/(tabs)/payments/new');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ödemeler</Text>
        <Text style={styles.headerSubtitle}>Bu ay</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: SUCCESS + '33' }]}>
          <Text style={styles.summaryLabel}>Bu Ay Gelir</Text>
          <Text style={[styles.summaryValue, { color: SUCCESS }]}>
            {formatAmount(summary.totalRevenue)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: WARNING + '33' }]}>
          <Text style={styles.summaryLabel}>Bekleyen</Text>
          <Text style={[styles.summaryValue, { color: WARNING }]}>
            {formatAmount(summary.pendingAmount)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: ERROR_COLOR + '33' }]}>
          <Text style={styles.summaryLabel}>Gecikmiş</Text>
          <Text style={[styles.summaryValue, { color: ERROR_COLOR }]}>
            {formatAmount(summary.overdueAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(
          [
            { key: 'all', label: 'Tümü' },
            { key: 'pending', label: 'Beklemede' },
            { key: 'paid', label: 'Ödendi' },
            { key: 'overdue', label: 'Gecikmiş' },
          ] as { key: StatusFilter; label: string }[]
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterChip, statusFilter === item.key && styles.filterChipActive]}
            onPress={() => setStatusFilter(item.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === item.key && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PaymentCard
            payment={item}
            studentName={studentNameById.get(item.student_id)}
            onPress={() => handlePaymentPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          filteredPayments.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="wallet-outline"
              title="Ödeme kaydı yok"
              subtitle="Ödeme eklemek için + butonuna tıklayın"
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddPayment}
        color="#FFFFFF"
      />

      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F7FF',
    borderWidth: 1,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: PRIMARY_LIGHT,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  filterChipTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 96,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: PRIMARY,
    borderRadius: 18,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
