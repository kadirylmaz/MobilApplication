// =============================================================================
// Ders Defteri — StudentCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { StudentRow } from '../../types/database';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const SUCCESS = '#10B981';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

interface StudentCardProps {
  student: StudentRow;
  onPress: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
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
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 72,
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
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
    color: TEXT_PRIMARY,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  badgeActive: {
    backgroundColor: '#D1FAE5',
  },
  badgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: SUCCESS,
  },
  badgeTextInactive: {
    color: TEXT_SECONDARY,
  },
});
