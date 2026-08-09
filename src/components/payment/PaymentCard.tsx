// =============================================================================
// Ders Defteri — PaymentCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { PaymentRow, PaymentStatus } from '../../types/database';

const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const ERROR_COLOR = '#EF4444';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

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
  pending: WARNING,
  paid: SUCCESS,
  overdue: ERROR_COLOR,
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

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
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
    marginHorizontal: 16,
    marginVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  content: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  studentName: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  period: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
