// =============================================================================
// Ders Defteri — WeekStrip Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addDays, format, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { colors, radius, spacing } from '../../theme';

interface WeekStripProps {
  weekStart: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeekStrip({
  weekStart,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}: WeekStripProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = days[6];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevWeek} style={styles.navButton} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.slate} />
        </TouchableOpacity>
        <Text style={styles.rangeLabel}>
          {format(weekStart, 'd MMM', { locale: tr })} – {format(weekEnd, 'd MMM yyyy', { locale: tr })}
        </Text>
        <TouchableOpacity onPress={onNextWeek} style={styles.navButton} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.slate} />
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        {days.map((day) => {
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[styles.dayCell, selected && styles.dayCellSelected]}
              onPress={() => onSelectDate(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayName, selected && styles.dayNameSelected]}>
                {format(day, 'EEEEEE', { locale: tr })}
              </Text>
              <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
                {format(day, 'd')}
              </Text>
              {today ? (
                <View style={[styles.todayDot, selected && styles.todayDotSelected]} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paperRaised,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.md + 2,
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
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  dayCell: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: 4,
  },
  dayCellSelected: {
    backgroundColor: colors.seal,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.seal,
  },
  todayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
});
