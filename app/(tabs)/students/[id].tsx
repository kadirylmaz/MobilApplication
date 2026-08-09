// =============================================================================
// Ders Defteri — Student Detail Screen
// =============================================================================

import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, Divider, FAB, Surface, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStudents } from '../../../src/hooks/useStudents';
import { useLessons } from '../../../src/hooks/useLessons';
import { LessonCard } from '../../../src/components/lesson/LessonCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import type { LessonRow } from '../../../src/types/database';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const SUCCESS = '#10B981';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { students, fetchStudents } = useStudents();
  const { fetchLessonsForStudent, getLessonsForStudent, isLoading } = useLessons();

  const student = students.find((s) => s.id === id);
  const lessons = getLessonsForStudent(id ?? '');

  useEffect(() => {
    if (!student && id) {
      fetchStudents();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchLessonsForStudent(id);
    }
  }, [id]);

  function handleLessonPress(lesson: LessonRow) {
    router.push(`/lessons/${lesson.id}`);
  }

  function handleAddLesson() {
    router.push(`/lessons/new?student_id=${id}`);
  }

  function handleEditStudent() {
    router.push(`/(tabs)/students/${id}/edit`);
  }

  if (!student) {
    return (
      <View style={styles.container}>
        <LoadingOverlay visible />
      </View>
    );
  }

  const initials = getInitials(student.full_name);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: student.full_name,
          headerRight: () => (
            <MaterialCommunityIcons
              name="pencil"
              size={24}
              color={PRIMARY}
              onPress={handleEditStudent}
              style={styles.editIcon}
            />
          ),
        }}
      />

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LessonCard lesson={item} onPress={() => handleLessonPress(item)} />
        )}
        contentContainerStyle={[
          styles.listContent,
          lessons.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View>
            {/* Info Card with avatar */}
            <View style={styles.infoCard}>
              {/* Avatar + Name Row */}
              <View style={styles.avatarRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.nameBlock}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {student.full_name}
                  </Text>
                  {(student.grade || student.subject) ? (
                    <Text style={styles.metaText}>
                      {[student.grade, student.subject].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                </View>
                <View style={[
                  styles.statusPill,
                  student.is_active ? styles.pillActive : styles.pillInactive,
                ]}>
                  <Text style={[
                    styles.pillText,
                    student.is_active ? styles.pillTextActive : styles.pillTextInactive,
                  ]}>
                    {student.is_active ? 'Aktif' : 'Pasif'}
                  </Text>
                </View>
              </View>

              {(student.phone || student.parent_name || student.parent_phone) ? (
                <Divider style={styles.divider} />
              ) : null}

              {student.phone ? (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={16} color={PRIMARY} />
                  <Text style={styles.infoText}>{student.phone}</Text>
                </View>
              ) : null}

              {student.parent_name ? (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account" size={16} color={PRIMARY} />
                  <Text style={styles.infoText}>Veli: {student.parent_name}</Text>
                </View>
              ) : null}

              {student.parent_phone ? (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone-outline" size={16} color={PRIMARY} />
                  <Text style={styles.infoText}>{student.parent_phone}</Text>
                </View>
              ) : null}

              {student.notes ? (
                <>
                  <Divider style={styles.divider} />
                  <Text style={styles.notesText}>{student.notes}</Text>
                </>
              ) : null}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ders Geçmişi</Text>
              <View style={styles.lessonCountBadge}>
                <Text style={styles.lessonCountText}>{lessons.length}</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="book-open-blank-variant"
              title="Henüz ders yok"
              subtitle="Ders eklemek için + butonuna tıklayın"
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        label="Ders Ekle"
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
  editIcon: {
    marginRight: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameBlock: {
    flex: 1,
    gap: 3,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  metaText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  pillActive: {
    backgroundColor: '#D1FAE5',
  },
  pillInactive: {
    backgroundColor: '#F3F4F6',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: SUCCESS,
  },
  pillTextInactive: {
    color: TEXT_SECONDARY,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: BORDER,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  lessonCountBadge: {
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lessonCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
