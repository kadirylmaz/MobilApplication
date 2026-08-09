// =============================================================================
// Ders Defteri — AppButton UI Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import type { ButtonProps } from 'react-native-paper';
import { colors, radius } from '../../theme';

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
      labelStyle={styles.label}
      {...rest}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    marginVertical: 6,
    shadowColor: colors.seal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    height: 52,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
