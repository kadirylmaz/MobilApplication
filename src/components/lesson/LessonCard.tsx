// =============================================================================
// Ders Defteri — LessonCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { LessonRow, LessonStatus } from '../../types/database';

const PRIMARY = '#5B4FCF';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const ERROR_COLOR = '#EF4444';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

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
  scheduled: PRIMARY,
  completed: SUCCESS,
  cancelled: ERROR_COLOR,
  compensated: WARNING,
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
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Colored left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: statusColor }]} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.date}>
              {formatScheduledAt(lesson.scheduled_at)}
            </Text>
            {lesson.topic ? (
              <Text style={styles.topic} numberOfLines={2}>
                {lesson.topic}
              </Text>
            ) : (
              <Text style={styles.noTopic}>Konu belirtilmemiş</Text>
            )}
            <Text style={styles.duration}>{lesson.duration_minutes} dakika</Text>
          </View>

          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  content: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  topic: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  noTopic: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  duration: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
