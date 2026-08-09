// =============================================================================
// Ders Defteri — Compensate Lesson Screen
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { lessonSchema, type LessonSchemaValues } from '../../src/validation/lessonSchemas';
import { useLessons } from '../../src/hooks/useLessons';
import { useStudentStore } from '../../src/store/studentStore';
import { maskDateInput, maskTimeInput } from '../../src/utils/dateInputMask';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../src/components/ui/AppTextInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { ErrorMessage } from '../../src/components/ui/ErrorMessage';
import { LoadingOverlay } from '../../src/components/ui/LoadingOverlay';
import { HeaderBackButton } from '../../src/components/ui/HeaderBackButton';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function CompensateLessonScreen() {
  const { original_id } = useLocalSearchParams<{ original_id: string }>();
  const router = useRouter();
  const { lessons, compensateLesson, isLoading, error } = useLessons();
  const students = useStudentStore((s) => s.students);

  const originalLesson = lessons.find((l) => l.id === original_id);
  const student = originalLesson
    ? students.find((s) => s.id === originalLesson.student_id)
    : undefined;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonSchemaValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      student_id: originalLesson?.student_id ?? '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: originalLesson?.duration_minutes ?? 60,
      topic: originalLesson?.topic ?? '',
      notes: '',
      status: 'compensated',
    },
  });

  if (!originalLesson) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Telafi Planla', headerLeft: () => <HeaderBackButton /> }} />
        <LoadingOverlay visible />
      </View>
    );
  }

  const originalDate = parseISO(originalLesson.scheduled_at);
  const formattedOriginalDate = format(originalDate, 'd MMMM yyyy', { locale: tr });
  const formattedOriginalTime = format(originalDate, 'HH:mm');

  async function onSubmit(values: LessonSchemaValues) {
    if (!original_id) return;
    try {
      await compensateLesson(original_id, {
        student_id: values.student_id,
        scheduled_date: values.scheduled_date,
        scheduled_time: values.scheduled_time,
        duration_minutes: values.duration_minutes,
        topic: values.topic ?? '',
        notes: values.notes ?? '',
        status: 'compensated',
      });
      router.back();
    } catch {
      // error is set in the store
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Telafi Planla', headerLeft: () => <HeaderBackButton /> }} />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.form}>
          <View style={styles.originalCard}>
            <View style={styles.originalIcon}>
              <MaterialCommunityIcons name="calendar-remove" size={20} color={colors.seal} />
            </View>
            <View style={styles.originalInfo}>
              <Text style={styles.originalLabel}>İptal Edilen Ders</Text>
              <Text style={styles.originalValue}>
                {formattedOriginalDate} · {formattedOriginalTime}
              </Text>
              {originalLesson.topic ? (
                <Text style={styles.originalMeta}>{originalLesson.topic}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.studentDisplay}>
            <View style={styles.studentDisplayIcon}>
              <MaterialCommunityIcons name="account" size={20} color={colors.seal} />
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

          <Text style={styles.sectionLabel}>Yeni Ders Zamanı</Text>

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
            label="Telafi Dersini Planla"
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
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
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
  originalCard: {
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
  originalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.paperRaised,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  originalInfo: {
    flex: 1,
  },
  originalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.sealDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  originalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  originalMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
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
  studentMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
