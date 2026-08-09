// =============================================================================
// Ders Defteri — HeaderBackButton Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY = '#5B4FCF';

export function HeaderBackButton() {
  const router = useRouter();

  return (
    <MaterialCommunityIcons
      name="arrow-left"
      size={24}
      color={PRIMARY}
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
