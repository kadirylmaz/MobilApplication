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

const PRIMARY = '#5B4FCF';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';

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
    backgroundColor: '#F8F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  countBadgeText: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 16,
  },
  toggleWrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 96,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: PRIMARY,
    borderRadius: 18,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
