// =============================================================================
// Ders Defteri — PaymentCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { PaymentRow, PaymentStatus } from '../../types/database';
import { colors, radius, spacing } from '../../theme';

interface PaymentCardProps {
  payment: PaymentRow;
  studentName?: string;
  onPress: () => void;
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  overdue: 'Gecikmiş',
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: colors.slate,
  paid: colors.moss,
  overdue: colors.rust,
};

const STATUS_SOFT_COLORS: Record<PaymentStatus, string> = {
  pending: colors.slateSoft,
  paid: colors.mossSoft,
  overdue: colors.rustSoft,
};

function isOverdue(payment: PaymentRow): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return payment.status === 'pending' && payment.period_end < today;
}

function formatAmount(amount: number): string {
  return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₺`;
}

function formatPeriod(start: string, end: string): string {
  const startStr = format(parseISO(start), 'd MMM', { locale: tr });
  const endStr = format(parseISO(end), 'd MMM yyyy', { locale: tr });
  return `${startStr} – ${endStr}`;
}

export function PaymentCard({ payment, studentName, onPress }: PaymentCardProps) {
  const overdue = isOverdue(payment);
  const effectiveStatus: PaymentStatus = overdue ? 'overdue' : payment.status;
  const statusColor = STATUS_COLORS[effectiveStatus];
  const statusSoftColor = STATUS_SOFT_COLORS[effectiveStatus];
  const statusLabel = STATUS_LABELS[effectiveStatus];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.accentBar, { backgroundColor: statusColor }]} />

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.info}>
            {studentName ? (
              <Text style={styles.studentName} numberOfLines={1}>
                {studentName}
              </Text>
            ) : null}
            <Text style={styles.amount}>{formatAmount(payment.amount)}</Text>
            <Text style={styles.period}>{formatPeriod(payment.period_start, payment.period_end)}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusSoftColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: 5,
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.md + 1,
    paddingHorizontal: spacing.md + 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm + 2,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  studentName: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  period: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
