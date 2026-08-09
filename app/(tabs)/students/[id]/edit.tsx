// =============================================================================
// Ders Defteri — Edit Student Screen
// =============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Switch, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, type StudentSchemaValues } from '../../../../src/validation/studentSchemas';
import { useStudents } from '../../../../src/hooks/useStudents';
import { ScreenWrapper } from '../../../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../../../src/components/ui/AppTextInput';
import { AppButton } from '../../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../../src/components/ui/ErrorMessage';
import { HeaderBackButton } from '../../../../src/components/ui/HeaderBackButton';

const PRIMARY = '#5B4FCF';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

export default function EditStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { students, updateStudent, isLoading, error } = useStudents();

  const student = students.find((s) => s.id === id);

  const {
    control,
    handleSubmit,
    reset,
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

  useEffect(() => {
    if (student) {
      reset({
        full_name: student.full_name,
        phone: student.phone ?? '',
        parent_name: student.parent_name ?? '',
        parent_phone: student.parent_phone ?? '',
        grade: student.grade ?? '',
        subject: student.subject ?? '',
        notes: student.notes ?? '',
        is_active: student.is_active,
      });
    }
  }, [student, reset]);

  async function onSubmit(values: StudentSchemaValues) {
    if (!id) return;
    try {
      await updateStudent(id, {
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
          title: 'Öğrenci Düzenle',
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Öğrenci Bilgileri</Text>

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
          <Text style={styles.sectionLabel}>Veli Bilgileri</Text>

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
          <Text style={styles.sectionLabel}>Ders Bilgileri</Text>

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
                <View>
                  <Text style={styles.switchLabel}>Aktif Öğrenci</Text>
                  <Text style={styles.switchSubLabel}>Öğrenci listesinde göster</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  color={PRIMARY}
                />
              </View>
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
    backgroundColor: '#F8F7FF',
  },
  form: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B4FCF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 2,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E5E7EB',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  switchSubLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  submitButton: {
    marginTop: 12,
  },
});
