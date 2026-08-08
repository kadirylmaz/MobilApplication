// =============================================================================
// Ders Defteri — Lesson Detail Screen
// =============================================================================

import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Surface, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { useLessons } from '../../src/hooks/useLessons';
import { useStudentStore } from '../../src/store/studentStore';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { LoadingOverlay } from '../../src/components/ui/LoadingOverlay';
import type { LessonStatus } from '../../src/types/database';

const STATUS_LABELS: Record<LessonStatus, string> = {
  scheduled: 'Planlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
  compensated: 'Telafi',
};

const STATUS_COLORS: Record<LessonStatus, string> = {
  scheduled: '#1565C0',
  completed: '#2E7D32',
  cancelled: '#B71C1C',
  compensated: '#E65100',
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
      <ScreenWrapper scrollable>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.headerRow}>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Ders Bilgileri
              </Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColor + '1A' }]}
                textStyle={[styles.statusChipText, { color: statusColor }]}
                compact
              >
                {statusLabel}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="labelMedium" style={styles.label}>
                Öğrenci
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {student?.full_name ?? 'Bilinmiyor'}
              </Text>
            </View>

            {student?.grade || student?.subject ? (
              <View style={styles.infoRow}>
                <Text variant="labelMedium" style={styles.label}>
                  Sınıf / Ders
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {[student.grade, student.subject].filter(Boolean).join(' · ')}
                </Text>
              </View>
            ) : null}

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="labelMedium" style={styles.label}>
                Tarih
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {formattedDate}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="labelMedium" style={styles.label}>
                Saat
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {formattedTime}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="labelMedium" style={styles.label}>
                Süre
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {lesson.duration_minutes} dakika
              </Text>
            </View>

            {lesson.topic ? (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text variant="labelMedium" style={styles.label}>
                    Konu
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {lesson.topic}
                  </Text>
                </View>
              </>
            ) : null}

            {lesson.notes ? (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoBlock}>
                  <Text variant="labelMedium" style={styles.label}>
                    Notlar
                  </Text>
                  <Text variant="bodyMedium" style={styles.notesText}>
                    {lesson.notes}
                  </Text>
                </View>
              </>
            ) : null}
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          {lesson.status !== 'completed' && lesson.status !== 'cancelled' ? (
            <Button
              mode="contained"
              onPress={handleMarkCompleted}
              loading={isLoading}
              disabled={isLoading}
              style={styles.completedButton}
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
              textColor="#B71C1C"
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
            textColor="#B00020"
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
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusChip: {
    alignSelf: 'center',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 16,
  },
  infoBlock: {
    gap: 6,
  },
  label: {
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    minWidth: 80,
  },
  value: {
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'right',
  },
  notesText: {
    color: '#424242',
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  completedButton: {
    backgroundColor: '#2E7D32',
  },
  cancelledButton: {
    borderColor: '#B71C1C',
  },
  deleteButton: {
    borderColor: '#B00020',
    marginTop: 8,
  },
});
