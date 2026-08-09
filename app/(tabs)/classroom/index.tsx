// =============================================================================
// Ders Defteri — Sınıfım ve Gruplarım Screen
// =============================================================================

import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useGroups } from '../../../src/hooks/useGroups';
import { GroupCard } from '../../../src/components/group/GroupCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import type { GroupRow } from '../../../src/types/database';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function ClassroomScreen() {
  const router = useRouter();
  const { groups, members, isLoading, fetchGroups, fetchMembers } = useGroups();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    groups.forEach((group) => {
      if (!members[group.id]) {
        fetchMembers(group.id);
      }
    });
  }, [groups]);

  function handleGroupPress(group: GroupRow) {
    router.push(`/(tabs)/classroom/${group.id}`);
  }

  function handleAddGroup() {
    router.push('/(tabs)/classroom/new');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Sınıfım ve Gruplarım</Text>
          <Text style={styles.headerSubtitle}>{groups.length} grup</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{groups.length}</Text>
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            memberCount={members[item.id]?.length ?? 0}
            onPress={() => handleGroupPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          groups.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="google-classroom"
              title="Henüz grup yok"
              subtitle="Öğrencilerinizi gruplamak için + butonuna tıklayın (Örn: 10-A)"
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB icon="plus" style={styles.fab} onPress={handleAddGroup} color="#FFFFFF" />

      <LoadingOverlay visible={isLoading && groups.length === 0} />
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
    backgroundColor: colors.sealSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm - 2,
    minWidth: 40,
    alignItems: 'center',
  },
  countBadgeText: {
    color: colors.sealDeep,
    fontWeight: '700',
    fontSize: 16,
  },
  listContent: {
    paddingVertical: spacing.md,
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
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
