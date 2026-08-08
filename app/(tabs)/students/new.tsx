// =============================================================================
// Ders Defteri — New Student Screen
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Switch, Text } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, type StudentSchemaValues } from '../../../src/validation/studentSchemas';
import { useStudents } from '../../../src/hooks/useStudents';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../../src/components/ui/AppTextInput';
import { AppButton } from '../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../src/components/ui/ErrorMessage';

export default function NewStudentScreen() {
  const router = useRouter();
  const { addStudent, isLoading, error } = useStudents();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSchemaValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      parent_name: '',
      parent_phone: '',
      grade: '',
      subject: '',
      notes: '',
      is_active: true,
    },
  });

  async function onSubmit(values: StudentSchemaValues) {
    try {
      await addStudent({
        full_name: values.full_name,
        phone: values.phone ?? '',
        parent_name: values.parent_name ?? '',
        parent_phone: values.parent_phone ?? '',
        grade: values.grade ?? '',
        subject: values.subject ?? '',
        notes: values.notes ?? '',
        is_active: values.is_active,
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
          title: 'Yeni Öğrenci',
          headerLeft: () => (
            <Text
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              İptal
            </Text>
          ),
        }}
      />
      <ScreenWrapper scrollable>
        <View style={styles.form}>
          <Controller
            control={control}
            name="full_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Ad Soyad *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.full_name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Telefon"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          <Divider style={styles.divider} />

          <Controller
            control={control}
            name="parent_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Veli Adı"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.parent_name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="parent_phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Veli Telefonu"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.parent_phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          <Divider style={styles.divider} />

          <Controller
            control={control}
            name="grade"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Sınıf"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.grade?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="subject"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Ders"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.subject?.message}
              />
            )}
          />

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

          <Controller
            control={control}
            name="is_active"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <Text variant="bodyLarge" style={styles.switchLabel}>
                  Aktif Öğrenci
                </Text>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  color="#6750A4"
                />
              </View>
            )}
          />

          <ErrorMessage message={error} />

          <AppButton
            label="Öğrenci Ekle"
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
  form: {
    gap: 4,
  },
  divider: {
    marginVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  switchLabel: {
    color: '#1a1a1a',
  },
  submitButton: {
    marginTop: 8,
  },
  cancelButton: {
    color: '#6750A4',
    fontSize: 16,
    marginLeft: 8,
  },
});
