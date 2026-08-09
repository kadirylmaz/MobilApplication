// =============================================================================
// Ders Defteri — Edit Payment Screen
// =============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { paymentSchema, type PaymentSchemaValues } from '../../../../src/validation/paymentSchemas';
import { usePayments } from '../../../../src/hooks/usePayments';
import { useStudentStore } from '../../../../src/store/studentStore';
import { maskDateInput } from '../../../../src/utils/dateInputMask';
import { ScreenWrapper } from '../../../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../../../src/components/ui/AppTextInput';
import { AppButton } from '../../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../../src/components/ui/ErrorMessage';
import { HeaderBackButton } from '../../../../src/components/ui/HeaderBackButton';
import { colors, radius, spacing, typography } from '../../../../src/theme';

export default function EditPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { payments, updatePayment, isLoading, error } = usePayments();
  const students = useStudentStore((s) => s.students);

  const payment = payments.find((p) => p.id === id);
  const student = payment ? students.find((s) => s.id === payment.student_id) : undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentSchemaValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      student_id: '',
      amount: '',
      payment_date: '',
      period_start: '',
      period_end: '',
      status: 'pending',
      notes: '',
    },
  });

  useEffect(() => {
    if (payment) {
      reset({
        student_id: payment.student_id,
        amount: String(payment.amount),
        payment_date: payment.payment_date ?? '',
        period_start: payment.period_start,
        period_end: payment.period_end,
        status: payment.status,
        notes: payment.notes ?? '',
      });
    }
  }, [payment, reset]);

  async function onSubmit(values: PaymentSchemaValues) {
    if (!id) return;
    try {
      await updatePayment(id, {
        amount: values.amount,
        payment_date: values.payment_date ?? '',
        period_start: values.period_start,
        period_end: values.period_end,
        status: values.status,
        notes: values.notes ?? '',
      });
      router.back();
    } catch {
      // error is set in the store
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ödeme Düzenle',
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.form}>
          <View style={styles.studentDisplay}>
            <View style={styles.studentDisplayIcon}>
              <MaterialCommunityIcons name="account" size={20} color={colors.seal} />
            </View>
            <View style={styles.studentDisplayInfo}>
              <Text style={styles.studentLabel}>Öğrenci</Text>
              <Text style={styles.studentName}>{student?.full_name ?? 'Bilinmiyor'}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Ödeme Bilgileri</Text>

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Tutar (₺) *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.amount?.message}
                keyboardType="decimal-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <View style={styles.statusRow}>
                {(
                  [
                    { key: 'pending', label: 'Beklemede' },
                    { key: 'paid', label: 'Ödendi' },
                    { key: 'overdue', label: 'Gecikmiş' },
                  ] as const
                ).map((item) => (
                  <View
                    key={item.key}
                    style={[styles.statusChip, value === item.key && styles.statusChipActive]}
                    onTouchEnd={() => onChange(item.key)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        value === item.key && styles.statusChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          />

          <Text style={styles.sectionLabel}>Dönem</Text>

          <Controller
            control={control}
            name="period_start"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Dönem Başlangıcı *"
                value={value}
                onChangeText={(text) => onChange(maskDateInput(text))}
                onBlur={onBlur}
                error={errors.period_start?.message}
                placeholder="YYYY-AA-GG"
                keyboardType="numeric"
                maxLength={10}
              />
            )}
          />

          <Controller
            control={control}
            name="period_end"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Dönem Sonu *"
                value={value}
                onChangeText={(text) => onChange(maskDateInput(text))}
                onBlur={onBlur}
                error={errors.period_end?.message}
                placeholder="YYYY-AA-GG"
                keyboardType="numeric"
                maxLength={10}
              />
            )}
          />

          <Controller
            control={control}
            name="payment_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Ödeme Tarihi"
                value={value ?? ''}
                onChangeText={(text) => onChange(maskDateInput(text))}
                onBlur={onBlur}
                error={errors.payment_date?.message}
                placeholder="YYYY-AA-GG (opsiyonel)"
                keyboardType="numeric"
                maxLength={10}
              />
            )}
          />

          <Text style={styles.sectionLabel}>Notlar</Text>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Notlar"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.notes?.message}
                multiline
                numberOfLines={4}
              />
            )}
          />

          <ErrorMessage message={error} />

          <AppButton
            label="Değişiklikleri Kaydet"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: colors.paper,
  },
  form: {
    gap: 4,
  },
  sectionLabel: {
    ...typography.eyebrow,
    color: colors.seal,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  studentDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.sealSoft,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  studentDisplayIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.paperRaised,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  studentDisplayInfo: {
    flex: 1,
  },
  studentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.seal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusChip: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
    alignItems: 'center',
    backgroundColor: colors.paperShade,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipActive: {
    backgroundColor: colors.sealSoft,
    borderColor: colors.seal,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusChipTextActive: {
    color: colors.sealDeep,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
