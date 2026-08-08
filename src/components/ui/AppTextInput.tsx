// =============================================================================
// Ders Defteri — AppTextInput UI Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';

interface AppTextInputProps extends Omit<TextInputProps, 'theme'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | null;
  placeholder?: string;
}

export function AppTextInput({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  ...rest
}: AppTextInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        mode="outlined"
        error={!!error}
        style={styles.input}
        {...rest}
      />
      {error ? (
        <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  helper: {
    marginTop: -4,
  },
});
