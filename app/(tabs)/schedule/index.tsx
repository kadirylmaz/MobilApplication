// =============================================================================
// Ders Defteri — Schedule Screen (Placeholder)
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';

export default function ScheduleScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <MaterialCommunityIcons name="calendar-clock" size={64} color="#9E9E9E" />
        <Text variant="headlineSmall" style={styles.title}>
          Program
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Faz 2'de eklenecek
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: '#424242',
    fontWeight: '600',
  },
  subtitle: {
    color: '#9E9E9E',
  },
});
