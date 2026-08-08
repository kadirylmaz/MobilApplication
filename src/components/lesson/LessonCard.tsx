// =============================================================================
// Ders Defteri — LessonCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';
import type { LessonRow, LessonStatus } from '../../types/database';

interface LessonCardProps {
  lesson: LessonRow;
  onPress: () => void;
}

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

function formatScheduledAt(isoString: string): string {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${dateStr} · ${timeStr}`;
}

export function LessonCard({ lesson, onPress }: LessonCardProps) {
  const statusColor = STATUS_COLORS[lesson.status];
  const statusLabel = STATUS_LABELS[lesson.status];

  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text variant="bodyMedium" style={styles.date}>
              {formatScheduledAt(lesson.scheduled_at)}
            </Text>
            {lesson.topic ? (
              <Text variant="titleSmall" style={styles.topic} numberOfLines={2}>
                {lesson.topic}
              </Text>
            ) : (
              <Text variant="titleSmall" style={styles.noTopic}>
                Konu belirtilmemiş
              </Text>
            )}
            <Text variant="bodySmall" style={styles.duration}>
              {lesson.duration_minutes} dakika
            </Text>
          </View>
          <Chip
            style={[styles.chip, { backgroundColor: statusColor + '1A' }]}
            textStyle={[styles.chipText, { color: statusColor }]}
            compact
          >
            {statusLabel}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  date: {
    color: '#616161',
    fontSize: 12,
  },
  topic: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  noTopic: {
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  duration: {
    color: '#757575',
    marginTop: 2,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
