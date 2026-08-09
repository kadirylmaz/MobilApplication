// =============================================================================
// Ders Defteri — EmptyState UI Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colors } from '../../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Icon source={icon} size={48} color={colors.seal} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  iconWrapper: {
    marginBottom: 4,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.sealSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 21,
  },
});
