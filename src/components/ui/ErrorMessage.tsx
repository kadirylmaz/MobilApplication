// =============================================================================
// Ders Defteri — ErrorMessage UI Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../theme';

interface ErrorMessageProps {
  message: string | null | undefined;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: colors.rust,
    fontSize: 13,
    fontWeight: '600',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
});
