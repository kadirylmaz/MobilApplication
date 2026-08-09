// =============================================================================
// Ders Defteri — WeekStrip Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addDays, format, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale/tr';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

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
          <MaterialCommunityIcons name="chevron-left" size={22} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.rangeLabel}>
          {format(weekStart, 'd MMM', { locale: tr })} – {format(weekEnd, 'd MMM yyyy', { locale: tr })}
        </Text>
        <TouchableOpacity onPress={onNextWeek} style={styles.navButton} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={PRIMARY} />
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingTop: 12,
    paddingBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dayCell: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  dayCellSelected: {
    backgroundColor: PRIMARY,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  todayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
});
