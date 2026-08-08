// =============================================================================
// Ders Defteri — ErrorMessage UI Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ErrorMessageProps {
  message: string | null | undefined;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: '#B00020',
    fontSize: 13,
    marginVertical: 6,
    paddingHorizontal: 4,
  },
});
