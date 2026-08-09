// =============================================================================
// Ders Defteri — Edit Profile Screen
// =============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  teacherProfileSchema,
  type TeacherProfileSchemaValues,
} from '../../../src/validation/teacherSchemas';
import { useAuth } from '../../../src/hooks/useAuth';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../../src/components/ui/AppTextInput';
import { AppButton } from '../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../src/components/ui/ErrorMessage';
import { HeaderBackButton } from '../../../src/components/ui/HeaderBackButton';

const PRIMARY = '#5B4FCF';
const TEXT_SECONDARY = '#6B7280';

export default function EditProfileScreen() {
  const router = useRouter();
  const { teacher, updateTeacher, isLoading, error } = useAuth();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherProfileSchemaValues>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (teacher) {
      reset({
        full_name: teacher.full_name,
        phone: teacher.phone ?? '',
      });
    }
  }, [teacher, reset]);

  async function onSubmit(values: TeacherProfileSchemaValues) {
    try {
      await updateTeacher({
        full_name: values.full_name,
        phone: values.phone ?? '',
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
          title: 'Profili Düzenle',
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Öğretmen Bilgileri</Text>

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

          {teacher?.email ? (
            <Text style={styles.emailNote}>
              E-posta: {teacher.email} (değiştirilemez)
            </Text>
          ) : null}

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
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 2,
  },
  emailNote: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
    marginLeft: 2,
  },
  submitButton: {
    marginTop: 16,
  },
});
