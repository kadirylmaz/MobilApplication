// =============================================================================
// Ders Defteri — Edit Lesson Screen
// =============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { lessonSchema, type LessonSchemaValues } from '../../../src/validation/lessonSchemas';
import { useLessons } from '../../../src/hooks/useLessons';
import { useStudentStore } from '../../../src/store/studentStore';
import { maskDateInput, maskTimeInput } from '../../../src/utils/dateInputMask';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../../src/components/ui/AppTextInput';
import { AppButton } from '../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../src/components/ui/ErrorMessage';
import { HeaderBackButton } from '../../../src/components/ui/HeaderBackButton';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';

export default function EditLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lessons, updateLesson, isLoading, error } = useLessons();
  const students = useStudentStore((s) => s.students);

  const lesson = lessons.find((l) => l.id === id);
  const student = lesson ? students.find((s) => s.id === lesson.student_id) : undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LessonSchemaValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      student_id: '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 60,
      topic: '',
      notes: '',
      status: 'scheduled',
    },
  });

  useEffect(() => {
    if (lesson) {
      reset({
        student_id: lesson.student_id,
        scheduled_date: lesson.scheduled_at.slice(0, 10),
        scheduled_time: lesson.scheduled_at.slice(11, 16),
        duration_minutes: lesson.duration_minutes,
        topic: lesson.topic ?? '',
        notes: lesson.notes ?? '',
        status: lesson.status,
      });
    }
  }, [lesson, reset]);

  async function onSubmit(values: LessonSchemaValues) {
    if (!id) return;
    try {
      await updateLesson(id, {
        scheduled_date: values.scheduled_date,
        scheduled_time: values.scheduled_time,
        duration_minutes: values.duration_minutes,
        topic: values.topic ?? '',
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
          title: 'Ders Düzenle',
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.form}>
          <View style={styles.studentDisplay}>
            <View style={styles.studentDisplayIcon}>
              <MaterialCommunityIcons name="account" size={20} color={PRIMARY} />
            </View>
            <View style={styles.studentDisplayInfo}>
              <Text style={styles.studentLabel}>Öğrenci</Text>
              <Text style={styles.studentName}>{student?.full_name ?? 'Bilinmiyor'}</Text>
              {student?.grade || student?.subject ? (
                <Text style={styles.studentMeta}>
                  {[student?.grade, student?.subject].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.sectionLabel}>Ders Zamanı</Text>

          <Controller
            control={control}
            name="scheduled_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Tarih *"
                value={value}
                onChangeText={(text) => onChange(maskDateInput(text))}
                onBlur={onBlur}
                error={errors.scheduled_date?.message}
                placeholder="YYYY-AA-GG"
                keyboardType="numeric"
                maxLength={10}
              />
            )}
          />

          <Controller
            control={control}
            name="scheduled_time"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Saat *"
                value={value}
                onChangeText={(text) => onChange(maskTimeInput(text))}
                onBlur={onBlur}
                error={errors.scheduled_time?.message}
                placeholder="SS:DD"
                keyboardType="numeric"
                maxLength={5}
              />
            )}
          />

          <Controller
            control={control}
            name="duration_minutes"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Süre (dakika)"
                value={String(value)}
                onChangeText={(text) => onChange(parseInt(text, 10) || 60)}
                onBlur={onBlur}
                error={errors.duration_minutes?.message}
                keyboardType="numeric"
              />
            )}
          />

          <Text style={styles.sectionLabel}>Ders Detayları</Text>

          <Controller
            control={control}
            name="topic"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Konu"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.topic?.message}
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
  studentMeta: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  submitButton: {
    marginTop: 12,
  },
});
