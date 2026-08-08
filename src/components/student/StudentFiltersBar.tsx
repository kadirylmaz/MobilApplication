// =============================================================================
// Ders Defteri — StudentFiltersBar Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SegmentedButtons, Searchbar } from 'react-native-paper';
import { useStudentStore } from '../../store/studentStore';

export function StudentFiltersBar() {
  const filters = useStudentStore((s) => s.filters);
  const setFilters = useStudentStore((s) => s.setFilters);

  const activeValue =
    filters.is_active === true
      ? 'active'
      : filters.is_active === false
        ? 'inactive'
        : 'all';

  function handleActiveChange(value: string) {
    if (value === 'active') setFilters({ is_active: true });
    else if (value === 'inactive') setFilters({ is_active: false });
    else setFilters({ is_active: null });
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Öğrenci ara..."
        value={filters.search}
        onChangeText={(text) => setFilters({ search: text })}
        style={styles.searchbar}
        elevation={0}
      />
      <SegmentedButtons
        value={activeValue}
        onValueChange={handleActiveChange}
        style={styles.segments}
        buttons={[
          { value: 'active', label: 'Aktif' },
          { value: 'all', label: 'Tümü' },
          { value: 'inactive', label: 'Pasif' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
    backgroundColor: '#ffffff',
  },
  searchbar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  segments: {
    borderRadius: 8,
  },
});
