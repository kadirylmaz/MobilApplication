// =============================================================================
// Ders Defteri — HeaderBackButton Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function HeaderBackButton() {
  const router = useRouter();

  return (
    <MaterialCommunityIcons
      name="arrow-left"
      size={24}
      color={colors.ink}
      onPress={() => router.back()}
      style={styles.icon}
      hitSlop={8}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    marginLeft: 8,
  },
});
