// =============================================================================
// Ders Defteri — Lesson Detail Screen
// =============================================================================

import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Surface, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLessons } from '../../src/hooks/useLessons';
import { useStudentStore } from '../../src/store/studentStore';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { LoadingOverlay } from '../../src/components/ui/LoadingOverlay';
import { HeaderBackButton } from '../../src/components/ui/HeaderBackButton';
import type { LessonStatus } from '../../src/types/database';
import { colors, radius, spacing, typography } from '../../src/theme';

const STATUS_LABELS: Record<LessonStatus, string> = {
  scheduled: 'Planlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
  compensated: 'Telafi',
};

const STATUS_COLORS: Record<LessonStatus, string> = {
  scheduled: colors.slate,
  completed: colors.moss,
  cancelled: colors.rust,
  compensated: colors.seal,
};

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lessons, updateLessonStatus, deleteLesson, isLoading } = useLessons();
  const students = useStudentStore((s) => s.students);

  const lesson = lessons.find((l) => l.id === id);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Ders Detayı', headerLeft: () => <HeaderBackButton /> }} />
        <LoadingOverlay visible />
      </View>
    );
  }

  const student = students.find((s) => s.id === lesson.student_id);
  const statusColor = STATUS_COLORS[lesson.status];
  const statusLabel = STATUS_LABELS[lesson.status];

  const scheduledDate = parseISO(lesson.scheduled_at);
  const formattedDate = format(scheduledDate, 'dd MMMM yyyy', { locale: tr });
  const formattedTime = format(scheduledDate, 'HH:mm');

  async function handleMarkCompleted() {
    await updateLessonStatus(lesson.id, 'completed');
  }

  async function handleMarkCancelled() {
    await updateLessonStatus(lesson.id, 'cancelled');
  }

  function handleDelete() {
    Alert.alert(
      'Dersi Sil',
      'Bu dersi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteLesson(lesson.id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Ders Detayı' }} />
      <ScreenWrapper scrollable style={styles.screenBg}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusColor + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusBannerText, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        {/* Main info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ders Bilgileri</Text>

          <Divider style={styles.divider} />

          {/* Student row */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons name="account" size={16} color={colors.seal} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Öğrenci</Text>
              <Text style={styles.value}>{student?.full_name ?? 'Bilinmiyor'}</Text>
              {student?.grade || student?.subject ? (
                <Text style={styles.valueSub}>
                  {[student.grade, student.subject].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Date/Time row */}
          <View style={styles.dateTimeRow}>
            <View style={[styles.infoRow, styles.flex1]}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="calendar" size={16} color={colors.seal} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Tarih</Text>
                <Text style={styles.value}>{formattedDate}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.flex1]}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.seal} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Saat</Text>
                <Text style={styles.value}>{formattedTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons name="timer-outline" size={16} color={colors.seal} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Süre</Text>
              <Text style={styles.value}>{lesson.duration_minutes} dakika</Text>
            </View>
          </View>

          {lesson.topic ? (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <MaterialCommunityIcons name="book-open-variant" size={16} color={colors.seal} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Konu</Text>
                  <Text style={styles.value}>{lesson.topic}</Text>
                </View>
              </View>
            </>
          ) : null}

          {lesson.notes ? (
            <>
              <Divider style={styles.divider} />
              <View style={styles.notesBlock}>
                <View style={styles.infoIconBox}>
                  <MaterialCommunityIcons name="note-text-outline" size={16} color={colors.seal} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Notlar</Text>
                  <Text style={styles.notesText}>{lesson.notes}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.push(`/lessons/${lesson.id}/edit`)}
            disabled={isLoading}
            style={styles.editButton}
            contentStyle={styles.buttonContent}
            textColor={colors.seal}
            icon="pencil"
          >
            Düzenle
          </Button>

          {lesson.status !== 'completed' && lesson.status !== 'cancelled' ? (
            <Button
              mode="contained"
              onPress={handleMarkCompleted}
              loading={isLoading}
              disabled={isLoading}
              style={styles.completedButton}
              contentStyle={styles.buttonContent}
              icon="check-circle"
            >
              Tamamlandı
            </Button>
          ) : null}

          {lesson.status !== 'cancelled' ? (
            <Button
              mode="outlined"
              onPress={handleMarkCancelled}
              loading={isLoading}
              disabled={isLoading}
              style={styles.cancelledButton}
              contentStyle={styles.buttonContent}
              textColor={colors.rust}
              icon="close-circle"
            >
              İptal Et
            </Button>
          ) : null}

          {lesson.status === 'cancelled' ? (
            <Button
              mode="contained"
              onPress={() => router.push(`/lessons/compensate?original_id=${lesson.id}`)}
              disabled={isLoading}
              style={styles.compensateButton}
              contentStyle={styles.buttonContent}
              icon="calendar-refresh"
            >
              Telafi Planla
            </Button>
          ) : null}

          <Button
            mode="outlined"
            onPress={handleDelete}
            loading={isLoading}
            disabled={isLoading}
            style={styles.deleteButton}
            contentStyle={styles.buttonContent}
            textColor={colors.rust}
            icon="delete"
          >
            Dersi Sil
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
    backgroundColor: colors.paper,
  },
  screenBg: {
    backgroundColor: colors.paper,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
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
    backgroundColor: colors.paperRaised,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: 4,
  },
  divider: {
    marginVertical: spacing.md,
    backgroundColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 4,
  },
  flex1: {
    flex: 1,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.sealSoft,
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  valueSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  notesBlock: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm + 2,
    paddingBottom: spacing.xxl,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  editButton: {
    borderColor: colors.seal,
    borderRadius: radius.sm,
  },
  completedButton: {
    backgroundColor: colors.moss,
    borderRadius: radius.sm,
  },
  cancelledButton: {
    borderColor: colors.rust,
    borderRadius: radius.sm,
  },
  compensateButton: {
    backgroundColor: colors.seal,
    borderRadius: radius.sm,
  },
  deleteButton: {
    borderColor: colors.rust,
    borderRadius: radius.sm,
    marginTop: 4,
  },
});
