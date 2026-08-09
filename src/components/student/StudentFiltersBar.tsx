// =============================================================================
// Ders Defteri — StudentFiltersBar Bileşeni
// =============================================================================

import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { useStudentStore } from '../../store/studentStore';
import { colors, radius, spacing } from '../../theme';

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
        placeholderTextColor={colors.textSecondary}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
    gap: spacing.sm + 2,
    backgroundColor: colors.paperRaised,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchbar: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
  },
  searchInput: {
    fontSize: 14,
    color: colors.ink,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: 4,
  },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: 7,
    backgroundColor: colors.paperShade,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.sealSoft,
    borderColor: colors.seal,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: colors.sealDeep,
  },
});
