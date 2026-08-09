// =============================================================================
// Ders Defteri — StudentFiltersBar Bileşeni
// =============================================================================

import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { useStudentStore } from '../../store/studentStore';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

const FILTER_BUTTONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'all', label: 'Tümü' },
  { value: 'inactive', label: 'Pasif' },
] as const;

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
        inputStyle={styles.searchInput}
        elevation={0}
        placeholderTextColor={TEXT_SECONDARY}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
      >
        {FILTER_BUTTONS.map((btn) => {
          const isSelected = activeValue === btn.value;
          return (
            <TouchableOpacity
              key={btn.value}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => handleActiveChange(btn.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  searchbar: {
    backgroundColor: '#F8F7FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    height: 44,
  },
  searchInput: {
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: BORDER,
  },
  pillSelected: {
    backgroundColor: PRIMARY_LIGHT,
    borderColor: PRIMARY,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  pillTextSelected: {
    color: PRIMARY,
  },
});
