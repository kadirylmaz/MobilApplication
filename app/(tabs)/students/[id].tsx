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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: student.full_name,
          headerRight: () => (
            <MaterialCommunityIcons
              name="pencil"
              size={24}
              color="#6750A4"
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
            <Surface style={styles.infoCard} elevation={1}>
              <View style={styles.nameRow}>
                <Text variant="headlineSmall" style={styles.studentName}>
                  {student.full_name}
                </Text>
                <Chip
                  style={[
                    styles.statusChip,
                    student.is_active ? styles.chipActive : styles.chipInactive,
                  ]}
                  textStyle={[
                    styles.chipText,
                    student.is_active ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                  compact
                >
                  {student.is_active ? 'Aktif' : 'Pasif'}
                </Chip>
              </View>

              {(student.grade || student.subject) && (
                <View style={styles.metaRow}>
                  {student.grade ? (
                    <Text variant="bodyMedium" style={styles.metaText}>
                      {student.grade}
                    </Text>
                  ) : null}
                  {student.grade && student.subject ? (
                    <Text variant="bodyMedium" style={styles.metaSeparator}>
                      {'·'}
                    </Text>
                  ) : null}
                  {student.subject ? (
                    <Text variant="bodyMedium" style={styles.metaText}>
                      {student.subject}
                    </Text>
                  ) : null}
                </View>
              )}

              <Divider style={styles.divider} />

              {student.phone ? (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={18} color="#616161" />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {student.phone}
                  </Text>
                </View>
              ) : null}

              {student.parent_name ? (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account" size={18} color="#616161" />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    Veli: {student.parent_name}
                  </Text>
                </View>
              ) : null}

              {student.parent_phone ? (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone-outline" size={18} color="#616161" />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {student.parent_phone}
                  </Text>
                </View>
              ) : null}

              {student.notes ? (
                <>
                  <Divider style={styles.divider} />
                  <Text variant="bodySmall" style={styles.notesText}>
                    {student.notes}
                  </Text>
                </>
              ) : null}
            </Surface>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ders Geçmişi
            </Text>
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
      />

      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  studentName: {
    flex: 1,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statusChip: {
    alignSelf: 'center',
  },
  chipActive: {
    backgroundColor: '#E8F5E9',
  },
  chipInactive: {
    backgroundColor: '#EEEEEE',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#2E7D32',
  },
  chipTextInactive: {
    color: '#757575',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    color: '#616161',
  },
  metaSeparator: {
    color: '#BDBDBD',
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    color: '#424242',
  },
  notesText: {
    color: '#616161',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6750A4',
  },
});
