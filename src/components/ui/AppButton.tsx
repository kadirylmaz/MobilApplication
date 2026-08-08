// =============================================================================
// Ders Defteri — AppButton UI Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import type { ButtonProps } from 'react-native-paper';

interface AppButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
  loading?: boolean;
  onPress: () => void;
}

export function AppButton({
  label,
  loading = false,
  onPress,
  mode = 'contained',
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      style={[styles.button, style]}
      contentStyle={styles.content}
      {...rest}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    marginVertical: 6,
  },
  content: {
    paddingVertical: 4,
  },
});
