// =============================================================================
// Ders Defteri — GroupMemberPicker Bileşeni
// =============================================================================
// Öğretmenin mevcut öğrenci listesinden gruba üye seçmesini sağlayan liste.

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StudentRow } from '../../types/database';
import { colors, spacing } from '../../theme';

interface GroupMemberPickerProps {
  students: StudentRow[];
  memberIds: string[];
  onToggle: (studentId: string) => void;
}

export function GroupMemberPicker({ students, memberIds, onToggle }: GroupMemberPickerProps) {
  return (
    <View style={styles.container}>
      {students.map((student) => {
        const selected = memberIds.includes(student.id);
        return (
          <TouchableOpacity
            key={student.id}
            style={styles.row}
            onPress={() => onToggle(student.id)}
            activeOpacity={0.7}
          >
            <View style={styles.info}>
              <Text style={styles.name}>{student.full_name}</Text>
              {student.grade ? <Text style={styles.meta}>{student.grade}</Text> : null}
            </View>
            <MaterialCommunityIcons
              name={selected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
              size={22}
              color={selected ? colors.seal : colors.borderStrong}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
