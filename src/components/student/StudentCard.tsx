// =============================================================================
// Ders Defteri — StudentCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { StudentRow } from '../../types/database';
import { colors, radius, spacing } from '../../theme';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

interface StudentCardProps {
  student: StudentRow;
  onPress: () => void;
}

export function StudentCard({ student, onPress }: StudentCardProps) {
  const initials = getInitials(student.full_name);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Center info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {student.full_name}
        </Text>
        {student.grade || student.subject ? (
          <View style={styles.meta}>
            {student.grade ? (
              <Text style={styles.metaText}>{student.grade}</Text>
            ) : null}
            {student.grade && student.subject ? (
              <Text style={styles.separator}>·</Text>
            ) : null}
            {student.subject ? (
              <Text style={styles.metaText}>{student.subject}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Right badge */}
      <View style={[
        styles.badge,
        student.is_active ? styles.badgeActive : styles.badgeInactive,
      ]}>
        <Text style={[
          styles.badgeText,
          student.is_active ? styles.badgeTextActive : styles.badgeTextInactive,
        ]}>
          {student.is_active ? 'Aktif' : 'Pasif'}
        </Text>
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    flexShrink: 0,
  },
  badgeActive: {
    backgroundColor: colors.mossSoft,
  },
  badgeInactive: {
    backgroundColor: colors.paperShade,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: colors.moss,
  },
  badgeTextInactive: {
    color: colors.textSecondary,
  },
});
