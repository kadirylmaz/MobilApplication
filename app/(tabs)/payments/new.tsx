// =============================================================================
// Ders Defteri — New Payment Screen
// =============================================================================

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { paymentSchema, type PaymentSchemaValues } from '../../../src/validation/paymentSchemas';
import { usePayments } from '../../../src/hooks/usePayments';
import { useStudents } from '../../../src/hooks/useStudents';
import { maskDateInput } from '../../../src/utils/dateInputMask';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../../src/components/ui/AppTextInput';
import { AppButton } from '../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../src/components/ui/ErrorMessage';
import { HeaderBackButton } from '../../../src/components/ui/HeaderBackButton';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';
const ERROR_COLOR = '#EF4444';

export default function NewPaymentScreen() {
  const { student_id } = useLocalSearchParams<{ student_id?: string }>();
  const router = useRouter();
  const { addPayment, isLoading, error } = usePayments();
  const { students } = useStudents();

  const prefilledStudent = student_id
    ? students.find((s) => s.id === student_id)
    : null;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentSchemaValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      student_id: student_id ?? '',
      amount: '',
      payment_date: '',
      period_start: '',
      period_end: '',
      status: 'pending',
      notes: '',
    },
  });

  async function onSubmit(values: PaymentSchemaValues) {
    try {
      await addPayment({
        student_id: values.student_id,
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
      <Stack.Screen options={{ title: 'Yeni Ödeme', headerLeft: () => <HeaderBackButton /> }} />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.form}>
          {student_id && prefilledStudent ? (
            <View style={styles.studentDisplay}>
              <View style={styles.studentDisplayIcon}>
                <MaterialCommunityIcons name="account" size={20} color={PRIMARY} />
              </View>
              <View style={styles.studentDisplayInfo}>
                <Text style={styles.studentLabel}>Öğrenci</Text>
                <Text style={styles.studentName}>{prefilledStudent.full_name}</Text>
              </View>
            </View>
          ) : (
            <Controller
              control={control}
              name="student_id"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text style={styles.pickerLabel}>Öğrenci *</Text>
                  {students.length === 0 ? (
                    <Text style={styles.noStudentsText}>Önce öğrenci eklemelisiniz.</Text>
                  ) : (
                    <ScrollView
                      style={styles.studentPickerScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                    >
                      {students.map((student) => (
                        <View
                          key={student.id}
                          style={[
                            styles.studentOption,
                            value === student.id && styles.studentOptionSelected,
                          ]}
                          onTouchEnd={() => onChange(student.id)}
                        >
                          <Text
                            style={[
                              styles.studentOptionText,
                              value === student.id && styles.studentOptionTextSelected,
                            ]}
                          >
                            {student.full_name}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  {errors.student_id ? (
                    <Text style={styles.fieldError}>{errors.student_id.message}</Text>
                  ) : null}
                </View>
              )}
            />
          )}

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
                placeholder="0"
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
            label="Ödeme Ekle"
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
    backgroundColor: '#F8F7FF',
  },
  form: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 2,
  },
  studentDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: PRIMARY_LIGHT,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(91,79,207,0.2)',
  },
  studentDisplayIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
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
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  studentPickerScroll: {
    maxHeight: 200,
  },
  studentOption: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  studentOptionSelected: {
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  studentOptionText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
  studentOptionTextSelected: {
    color: PRIMARY,
    fontWeight: '700',
  },
  noStudentsText: {
    color: ERROR_COLOR,
    fontSize: 14,
    marginBottom: 8,
  },
  fieldError: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: BORDER,
  },
  statusChipActive: {
    backgroundColor: PRIMARY_LIGHT,
    borderColor: PRIMARY,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  statusChipTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 12,
  },
});
