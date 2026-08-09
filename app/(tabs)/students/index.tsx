// =============================================================================
// Ders Defteri — Students List Screen
// =============================================================================

import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useStudents } from '../../../src/hooks/useStudents';
import { StudentCard } from '../../../src/components/student/StudentCard';
import { StudentFiltersBar } from '../../../src/components/student/StudentFiltersBar';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import type { StudentRow } from '../../../src/types/database';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';

export default function StudentsScreen() {
  const router = useRouter();
  const { fetchStudents, filteredStudents, isLoading } = useStudents();

  useEffect(() => {
    fetchStudents();
  }, []);

  function handleStudentPress(student: StudentRow) {
    router.push(`/(tabs)/students/${student.id}`);
  }

  function handleAddStudent() {
    router.push('/(tabs)/students/new');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Öğrencilerim</Text>
          <Text style={styles.headerSubtitle}>
            {filteredStudents.length} öğrenci
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{filteredStudents.length}</Text>
        </View>
      </View>

      <StudentFiltersBar />

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentCard
            student={item}
            onPress={() => handleStudentPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          filteredStudents.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="account-group"
              title="Henüz öğrenci yok"
              subtitle="Yeni öğrenci eklemek için + butonuna tıklayın"
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddStudent}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    backgroundColor: PRIMARY_LIGHT,
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
  listContent: {
    paddingVertical: 12,
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
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
