// =============================================================================
// Ders Defteri — LessonCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { LessonRow, LessonStatus } from '../../types/database';
import { colors, radius, spacing } from '../../theme';

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
  scheduled: colors.slate,
  completed: colors.moss,
  cancelled: colors.rust,
  compensated: colors.seal,
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
    marginHorizontal: spacing.lg,
    marginVertical: 5,
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  content: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: spacing.md + 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm + 2,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  topic: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  noTopic: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  duration: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
