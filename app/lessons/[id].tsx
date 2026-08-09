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
import type { LessonStatus } from '../../src/types/database';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const ERROR_COLOR = '#EF4444';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

const STATUS_LABELS: Record<LessonStatus, string> = {
  scheduled: 'Planlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
  compensated: 'Telafi',
};

const STATUS_COLORS: Record<LessonStatus, string> = {
  scheduled: PRIMARY,
  completed: SUCCESS,
  cancelled: ERROR_COLOR,
  compensated: WARNING,
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
        <Stack.Screen options={{ title: 'Ders Detayı' }} />
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
              <MaterialCommunityIcons name="account" size={16} color={PRIMARY} />
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
                <MaterialCommunityIcons name="calendar" size={16} color={PRIMARY} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Tarih</Text>
                <Text style={styles.value}>{formattedDate}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.flex1]}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={PRIMARY} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Saat</Text>
                <Text style={styles.value}>{formattedTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons name="timer-outline" size={16} color={PRIMARY} />
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
                  <MaterialCommunityIcons name="book-open-variant" size={16} color={PRIMARY} />
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
                  <MaterialCommunityIcons name="note-text-outline" size={16} color={PRIMARY} />
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
              textColor={ERROR_COLOR}
              icon="close-circle"
            >
              İptal Et
            </Button>
          ) : null}

          <Button
            mode="outlined"
            onPress={handleDelete}
            loading={isLoading}
            disabled={isLoading}
            style={styles.deleteButton}
            contentStyle={styles.buttonContent}
            textColor={ERROR_COLOR}
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
    backgroundColor: '#F8F7FF',
  },
  screenBg: {
    backgroundColor: '#F8F7FF',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: BORDER,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  flex1: {
    flex: 1,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: PRIMARY_LIGHT,
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
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  valueSub: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 1,
  },
  notesBlock: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  notesText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    paddingBottom: 32,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  completedButton: {
    backgroundColor: SUCCESS,
    borderRadius: 12,
  },
  cancelledButton: {
    borderColor: ERROR_COLOR,
    borderRadius: 12,
  },
  deleteButton: {
    borderColor: ERROR_COLOR,
    borderRadius: 12,
    marginTop: 4,
  },
});
