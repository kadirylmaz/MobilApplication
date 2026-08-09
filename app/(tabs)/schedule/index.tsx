// =============================================================================
// Ders Defteri — Schedule Screen
// =============================================================================

import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, SegmentedButtons, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { useLessons } from '../../../src/hooks/useLessons';
import { WeekStrip } from '../../../src/components/lesson/WeekStrip';
import { MonthGrid } from '../../../src/components/lesson/MonthGrid';
import { LessonCard } from '../../../src/components/lesson/LessonCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import type { LessonRow } from '../../../src/types/database';
import { colors, radius, spacing, typography } from '../../../src/theme';

type ViewMode = 'week' | 'month';

export default function ScheduleScreen() {
  const router = useRouter();
  const { lessons, fetchLessonsInRange, isLoading } = useLessons();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));

  useFocusEffect(
    useCallback(() => {
      if (viewMode === 'week') {
        const rangeStart = weekStart;
        const rangeEnd = addDays(weekStart, 7);
        fetchLessonsInRange(rangeStart.toISOString(), rangeEnd.toISOString());
      } else {
        const rangeStart = startOfMonth(monthDate);
        const rangeEnd = addDays(endOfMonth(monthDate), 1);
        fetchLessonsInRange(rangeStart.toISOString(), rangeEnd.toISOString());
      }
    }, [viewMode, weekStart, monthDate, fetchLessonsInRange]),
  );

  const dayLessons = useMemo(() => {
    return lessons
      .filter((lesson) => isSameDay(parseISO(lesson.scheduled_at), selectedDate))
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }, [lessons, selectedDate]);

  function handlePrevWeek() {
    const newWeekStart = subWeeks(weekStart, 1);
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  }

  function handleNextWeek() {
    const newWeekStart = addWeeks(weekStart, 1);
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  }

  function handlePrevMonth() {
    const newMonthDate = subMonths(monthDate, 1);
    setMonthDate(newMonthDate);
    setSelectedDate(newMonthDate);
  }

  function handleNextMonth() {
    const newMonthDate = addMonths(monthDate, 1);
    setMonthDate(newMonthDate);
    setSelectedDate(newMonthDate);
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
  }

  function handleLessonPress(lesson: LessonRow) {
    router.push(`/lessons/${lesson.id}`);
  }

  function handleAddLesson() {
    router.push('/lessons/new');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Program</Text>
          <Text style={styles.headerSubtitle}>
            {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{dayLessons.length}</Text>
        </View>
      </View>

      <View style={styles.toggleWrap}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
          buttons={[
            { value: 'week', label: 'Hafta' },
            { value: 'month', label: 'Ay' },
          ]}
        />
      </View>

      {viewMode === 'week' ? (
        <WeekStrip
          weekStart={weekStart}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      ) : (
        <MonthGrid
          monthDate={monthDate}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          lessons={lessons}
        />
      )}

      {dayLessons.length === 0 && !isLoading ? (
        <EmptyState
          icon="calendar-blank-outline"
          title="Bu gün için ders yok"
          subtitle="Yeni ders eklemek için + butonuna tıklayın"
        />
      ) : (
        <View style={styles.listContent}>
          {dayLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onPress={() => handleLessonPress(lesson)}
            />
          ))}
        </View>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddLesson}
        color="#FFFFFF"
      />

      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    backgroundColor: colors.paperRaised,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
  },
  headerSubtitle: {
    ...typography.bodySecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: colors.slateSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm - 2,
    minWidth: 40,
    alignItems: 'center',
  },
  countBadgeText: {
    color: colors.slate,
    fontWeight: '700',
    fontSize: 16,
  },
  toggleWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.paperRaised,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: 96,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: colors.seal,
    borderRadius: radius.lg,
    shadowColor: colors.seal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
