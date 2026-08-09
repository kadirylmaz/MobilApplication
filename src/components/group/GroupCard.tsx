// =============================================================================
// Ders Defteri — GroupCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { GroupRow } from '../../types/database';
import { colors, radius, spacing } from '../../theme';

interface GroupCardProps {
  group: GroupRow;
  memberCount: number;
  onPress: () => void;
}

export function GroupCard({ group, memberCount, onPress }: GroupCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="google-classroom" size={22} color={colors.seal} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
        {group.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {group.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.badge}>
        <MaterialCommunityIcons name="account-multiple" size={14} color={colors.sealDeep} />
        <Text style={styles.badgeText}>{memberCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: 5,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 72,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.sealSoft,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.sealSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sealDeep,
  },
});
