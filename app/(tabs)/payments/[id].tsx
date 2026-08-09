// =============================================================================
// Ders Defteri — Payment Detail Screen
// =============================================================================

import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePayments } from '../../../src/hooks/usePayments';
import { useStudentStore } from '../../../src/store/studentStore';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import { HeaderBackButton } from '../../../src/components/ui/HeaderBackButton';
import type { PaymentRow, PaymentStatus } from '../../../src/types/database';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const ERROR_COLOR = '#EF4444';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

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
  return `${amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺`;
}

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { payments, updatePaymentStatus, deletePayment, isLoading } = usePayments();
  const students = useStudentStore((s) => s.students);

  const payment = payments.find((p) => p.id === id);

  if (!payment) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Ödeme Detayı', headerLeft: () => <HeaderBackButton /> }} />
        <LoadingOverlay visible />
      </View>
    );
  }

  const student = students.find((s) => s.id === payment.student_id);
  const overdue = isOverdue(payment);
  const effectiveStatus: PaymentStatus = overdue ? 'overdue' : payment.status;
  const statusColor = STATUS_COLORS[effectiveStatus];
  const statusLabel = STATUS_LABELS[effectiveStatus];

  const periodStartStr = format(parseISO(payment.period_start), 'd MMMM yyyy', { locale: tr });
  const periodEndStr = format(parseISO(payment.period_end), 'd MMMM yyyy', { locale: tr });
  const paymentDateStr = payment.payment_date
    ? format(parseISO(payment.payment_date), 'd MMMM yyyy', { locale: tr })
    : null;

  async function handleMarkPaid() {
    await updatePaymentStatus(payment.id, 'paid');
  }

  async function handleMarkPending() {
    await updatePaymentStatus(payment.id, 'pending');
  }

  function handleDelete() {
    Alert.alert(
      'Ödemeyi Sil',
      'Bu ödeme kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deletePayment(payment.id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Ödeme Detayı' }} />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={[styles.statusBanner, { backgroundColor: statusColor + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusBannerText, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ödeme Bilgileri</Text>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons name="account" size={16} color={PRIMARY} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Öğrenci</Text>
              <Text style={styles.value}>{student?.full_name ?? 'Bilinmiyor'}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons name="cash" size={16} color={PRIMARY} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Tutar</Text>
              <Text style={styles.amountValue}>{formatAmount(payment.amount)}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.dateTimeRow}>
            <View style={[styles.infoRow, styles.flex1]}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="calendar-start" size={16} color={PRIMARY} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Dönem Başı</Text>
                <Text style={styles.value}>{periodStartStr}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.flex1]}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="calendar-end" size={16} color={PRIMARY} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Dönem Sonu</Text>
                <Text style={styles.value}>{periodEndStr}</Text>
              </View>
            </View>
          </View>

          {paymentDateStr ? (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <MaterialCommunityIcons name="calendar-check" size={16} color={PRIMARY} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Ödeme Tarihi</Text>
                  <Text style={styles.value}>{paymentDateStr}</Text>
                </View>
              </View>
            </>
          ) : null}

          {payment.notes ? (
            <>
              <Divider style={styles.divider} />
              <View style={styles.notesBlock}>
                <View style={styles.infoIconBox}>
                  <MaterialCommunityIcons name="note-text-outline" size={16} color={PRIMARY} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Notlar</Text>
                  <Text style={styles.notesText}>{payment.notes}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.push(`/(tabs)/payments/${payment.id}/edit`)}
            disabled={isLoading}
            style={styles.editButton}
            contentStyle={styles.buttonContent}
            textColor={PRIMARY}
            icon="pencil"
          >
            Düzenle
          </Button>

          {payment.status !== 'paid' ? (
            <Button
              mode="contained"
              onPress={handleMarkPaid}
              loading={isLoading}
              disabled={isLoading}
              style={styles.paidButton}
              contentStyle={styles.buttonContent}
              icon="check-circle"
            >
              Ödendi Olarak İşaretle
            </Button>
          ) : (
            <Button
              mode="outlined"
              onPress={handleMarkPending}
              loading={isLoading}
              disabled={isLoading}
              style={styles.pendingButton}
              contentStyle={styles.buttonContent}
              textColor={WARNING}
              icon="clock-outline"
            >
              Beklemede Olarak İşaretle
            </Button>
          )}

          <Button
            mode="outlined"
            onPress={handleDelete}
            loading={isLoading}
            disabled={isLoading}
            style={styles.deleteButton}
            contentStyle={styles.buttonContent}
            textColor={ERROR_COLOR}
            icon="delete"
          >
            Ödemeyi Sil
          </Button>
        </View>

        <LoadingOverlay visible={isLoading} />
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  screenBg: {
    backgroundColor: '#F8F7FF',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: BORDER,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  flex1: {
    flex: 1,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_PRIMARY,
  },
  notesBlock: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  notesText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    paddingBottom: 32,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  editButton: {
    borderColor: PRIMARY,
    borderRadius: 12,
  },
  paidButton: {
    backgroundColor: SUCCESS,
    borderRadius: 12,
  },
  pendingButton: {
    borderColor: WARNING,
    borderRadius: 12,
  },
  deleteButton: {
    borderColor: ERROR_COLOR,
    borderRadius: 12,
    marginTop: 4,
  },
});
