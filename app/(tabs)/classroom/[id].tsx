// =============================================================================
// Ders Defteri — Group Detail Screen
// =============================================================================

import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGroups } from '../../../src/hooks/useGroups';
import { useStudents } from '../../../src/hooks/useStudents';
import { GroupMemberPicker } from '../../../src/components/group/GroupMemberPicker';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppButton } from '../../../src/components/ui/AppButton';
import { HeaderBackButton } from '../../../src/components/ui/HeaderBackButton';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { groups, members, isLoading, fetchMembers, addMember, removeMember, deleteGroup } =
    useGroups();
  const { students, fetchStudents } = useStudents();

  const group = groups.find((g) => g.id === id);
  const groupMembers = members[id] ?? [];
  const memberIds = groupMembers.map((s) => s.id);

  useEffect(() => {
    if (id) fetchMembers(id);
    fetchStudents();
  }, [id]);

  function handleToggle(studentId: string) {
    if (memberIds.includes(studentId)) {
      removeMember(id, studentId);
    } else {
      addMember(id, studentId);
    }
  }

  function handleDelete() {
    Alert.alert('Grubu Sil', 'Bu grubu silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteGroup(id);
          router.back();
        },
      },
    ]);
  }

  if (!group) {
    return (
      <ScreenWrapper style={styles.screenBg}>
        <LoadingOverlay visible={isLoading} />
      </ScreenWrapper>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: group.name, headerLeft: () => <HeaderBackButton /> }} />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.container}>
          <View style={styles.infoCard}>
            <View style={styles.infoCardTabStrip} />
            <View style={styles.infoCardBody}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="google-classroom" size={26} color={colors.seal} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.name}>{group.name}</Text>
                {group.description ? (
                  <Text style={styles.description}>{group.description}</Text>
                ) : null}
                <Text style={styles.memberCount}>{groupMembers.length} öğrenci</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton
              label="Grubu Düzenle"
              mode="outlined"
              onPress={() => router.push(`/(tabs)/classroom/${id}/edit`)}
              style={styles.editButton}
            />
            <AppButton
              label="Grubu Sil"
              mode="contained"
              onPress={handleDelete}
              style={styles.deleteButton}
            />
          </View>

          <Text style={styles.sectionLabel}>Öğrenciler</Text>
          <ScrollView nestedScrollEnabled style={styles.pickerScroll}>
            <GroupMemberPicker
              students={students}
              memberIds={memberIds}
              onToggle={handleToggle}
            />
          </ScrollView>
        </View>
      </ScreenWrapper>
      <LoadingOverlay visible={isLoading} />
    </>
  );
}

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: colors.paper,
  },
  container: {
    gap: 4,
  },
  infoCard: {
    borderRadius: radius.md,
    backgroundColor: colors.paperRaised,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCardTabStrip: {
    height: 4,
    backgroundColor: colors.seal,
  },
  infoCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    padding: spacing.lg,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.sealSoft,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  memberCount: {
    fontSize: 12,
    color: colors.sealDeep,
    fontWeight: '700',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  editButton: {
    flex: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.rust,
  },
  sectionLabel: {
    ...typography.eyebrow,
    color: colors.seal,
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  pickerScroll: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    maxHeight: 400,
  },
});
