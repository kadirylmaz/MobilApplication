// =============================================================================
// Ders Defteri — New Lesson Screen
// =============================================================================

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lessonSchema, type LessonSchemaValues } from '../../src/validation/lessonSchemas';
import { useLessons } from '../../src/hooks/useLessons';
import { useStudents } from '../../src/hooks/useStudents';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../src/components/ui/AppTextInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { ErrorMessage } from '../../src/components/ui/ErrorMessage';

export default function NewLessonScreen() {
  const { student_id } = useLocalSearchParams<{ student_id?: string }>();
  const router = useRouter();
  const { addLesson, isLoading, error } = useLessons();
  const { students } = useStudents();

  const prefilledStudent = student_id
    ? students.find((s) => s.id === student_id)
    : null;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonSchemaValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      student_id: student_id ?? '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 60,
      topic: '',
      notes: '',
      status: 'scheduled',
    },
  });

  async function onSubmit(values: LessonSchemaValues) {
    try {
      await addLesson({
        student_id: values.student_id,
        scheduled_date: values.scheduled_date,
        scheduled_time: values.scheduled_time,
        duration_minutes: values.duration_minutes,
        topic: values.topic ?? '',
        notes: values.notes ?? '',
        status: values.status,
      });
      router.back();
    } catch {
      // error is set in the store
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Ders' }} />
      <ScreenWrapper scrollable>
        <View style={styles.form}>
          {student_id && prefilledStudent ? (
            <Surface style={styles.studentDisplay} elevation={1}>
              <Text variant="labelMedium" style={styles.studentLabel}>
                Öğrenci
              </Text>
              <Text variant="bodyLarge" style={styles.studentName}>
                {prefilledStudent.full_name}
              </Text>
              {prefilledStudent.grade || prefilledStudent.subject ? (
                <Text variant="bodySmall" style={styles.studentMeta}>
                  {[prefilledStudent.grade, prefilledStudent.subject]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ) : null}
            </Surface>
          ) : (
            <Controller
              control={control}
              name="student_id"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text variant="labelMedium" style={styles.pickerLabel}>
                    Öğrenci *
                  </Text>
                  {students.length === 0 ? (
                    <Text variant="bodyMedium" style={styles.noStudentsText}>
                      Önce öğrenci eklemelisiniz.
                    </Text>
                  ) : (
                    <ScrollView
                      style={styles.studentPickerScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                    >
                      {students.map((student) => (
                        <Surface
                          key={student.id}
                          style={[
                            styles.studentOption,
                            value === student.id && styles.studentOptionSelected,
                          ]}
                          elevation={1}
                          onTouchEnd={() => onChange(student.id)}
                        >
                          <Text
                            variant="bodyMedium"
                            style={[
                              styles.studentOptionText,
                              value === student.id && styles.studentOptionTextSelected,
                            ]}
                          >
                            {student.full_name}
                          </Text>
                          {student.grade || student.subject ? (
                            <Text variant="bodySmall" style={styles.studentOptionMeta}>
                              {[student.grade, student.subject]
                                .filter(Boolean)
                                .join(' · ')}
                            </Text>
                          ) : null}
                        </Surface>
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

          <Controller
            control={control}
            name="scheduled_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Tarih *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.scheduled_date?.message}
                placeholder="YYYY-AA-GG"
                keyboardType="numeric"
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
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.scheduled_time?.message}
                placeholder="SS:DD"
                keyboardType="numeric"
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
            label="Ders Ekle"
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
  studentDisplay: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F3EDF7',
    marginBottom: 8,
  },
  studentLabel: {
    color: '#6750A4',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  studentName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  studentMeta: {
    color: '#616161',
    marginTop: 2,
  },
  pickerLabel: {
    color: '#6750A4',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  studentPickerScroll: {
    maxHeight: 200,
  },
  studentOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#ffffff',
  },
  studentOptionSelected: {
    backgroundColor: '#EDE7F6',
    borderWidth: 1.5,
    borderColor: '#6750A4',
  },
  studentOptionText: {
    color: '#424242',
  },
  studentOptionTextSelected: {
    color: '#6750A4',
    fontWeight: '600',
  },
  studentOptionMeta: {
    color: '#9E9E9E',
    marginTop: 2,
  },
  noStudentsText: {
    color: '#B00020',
    marginBottom: 8,
  },
  fieldError: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 8,
  },
});
