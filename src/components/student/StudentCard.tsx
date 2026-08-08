// =============================================================================
// Ders Defteri — StudentCard Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Card, Text } from 'react-native-paper';
import type { StudentRow } from '../../types/database';

interface StudentCardProps {
  student: StudentRow;
  onPress: () => void;
}

export function StudentCard({ student, onPress }: StudentCardProps) {
  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
            {student.full_name}
          </Text>
          <Badge
            style={[
              styles.badge,
              student.is_active ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            {student.is_active ? 'Aktif' : 'Pasif'}
          </Badge>
        </View>

        {student.grade || student.subject ? (
          <View style={styles.meta}>
            {student.grade ? (
              <Text variant="bodySmall" style={styles.metaText}>
                {student.grade}
              </Text>
            ) : null}
            {student.grade && student.subject ? (
              <Text variant="bodySmall" style={styles.separator}>
                {'·'}
              </Text>
            ) : null}
            {student.subject ? (
              <Text variant="bodySmall" style={styles.metaText}>
                {student.subject}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  badge: {
    alignSelf: 'center',
    fontSize: 11,
  },
  badgeActive: {
    backgroundColor: '#2E7D32',
  },
  badgeInactive: {
    backgroundColor: '#757575',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaText: {
    color: '#616161',
  },
  separator: {
    color: '#BDBDBD',
  },
});
