// =============================================================================
// Ders Defteri — MonthGrid Bileşeni
// =============================================================================

import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { LessonRow } from '../../types/database';
import { colors, radius, spacing } from '../../theme';

const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

interface MonthGridProps {
  monthDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  lessons: LessonRow[];
}

export function MonthGrid({
  monthDate,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  lessons,
}: MonthGridProps) {
  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [monthDate]);

  const lessonDayKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const lesson of lessons) {
      keys.add(format(parseISO(lesson.scheduled_at), 'yyyy-MM-dd'));
    }
    return keys;
  }, [lessons]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navButton} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.slate} />
        </TouchableOpacity>
        <Text style={styles.rangeLabel}>
          {format(monthDate, 'MMMM yyyy', { locale: tr })}
        </Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.navButton} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.slate} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthDate);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const hasLesson = lessonDayKeys.has(format(day, 'yyyy-MM-dd'));

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={styles.dayCell}
              onPress={() => onSelectDate(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNumber,
                  !inMonth && styles.dayNumberMuted,
                  selected && styles.dayNumberSelected,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {hasLesson ? (
                <View style={[styles.lessonDot, selected && styles.lessonDotSelected]} />
              ) : null}
              {today && !selected ? <View style={styles.todayRing} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE_PERCENT = `${100 / 7}%` as const;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paperRaised,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slateSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    width: CELL_SIZE_PERCENT,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  dayCell: {
    width: CELL_SIZE_PERCENT,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    width: 32,
    height: 32,
    lineHeight: 32,
    textAlign: 'center',
    borderRadius: 16,
  },
  dayNumberMuted: {
    color: colors.textMuted,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    backgroundColor: colors.seal,
    overflow: 'hidden',
  },
  lessonDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate,
  },
  lessonDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  todayRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.seal,
  },
});
