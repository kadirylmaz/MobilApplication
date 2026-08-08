// =============================================================================
// Ders Defteri — Students List Screen
// =============================================================================

import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useStudents } from '../../../src/hooks/useStudents';
import { StudentCard } from '../../../src/components/student/StudentCard';
import { StudentFiltersBar } from '../../../src/components/student/StudentFiltersBar';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import type { StudentRow } from '../../../src/types/database';

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
  listContent: {
    paddingVertical: 8,
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6750A4',
  },
});
