// =============================================================================
// Ders Defteri — New Lesson Screen
// =============================================================================

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { lessonSchema, type LessonSchemaValues } from '../../src/validation/lessonSchemas';
import { useLessons } from '../../src/hooks/useLessons';
import { useStudents } from '../../src/hooks/useStudents';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../src/components/ui/AppTextInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { ErrorMessage } from '../../src/components/ui/ErrorMessage';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';
const ERROR_COLOR = '#EF4444';

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
                {prefilledStudent.grade || prefilledStudent.subject ? (
                  <Text style={styles.studentMeta}>
                    {[prefilledStudent.grade, prefilledStudent.subject]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <Controller
              control={control}
              name="student_id"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text style={styles.pickerLabel}>Öğrenci *</Text>
                  {students.length === 0 ? (
                    <Text style={styles.noStudentsText}>
                      Önce öğrenci eklemelisiniz.
                    </Text>
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
                          {student.grade || student.subject ? (
                            <Text style={styles.studentOptionMeta}>
                              {[student.grade, student.subject]
                                .filter(Boolean)
                                .join(' · ')}
                            </Text>
                          ) : null}
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

          <Text style={styles.sectionLabel}>Ders Zamanı</Text>

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
  studentOptionMeta: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
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
  submitButton: {
    marginTop: 12,
  },
});
