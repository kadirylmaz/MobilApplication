// =============================================================================
// Ders Defteri — CommentInput Bileşeni
// =============================================================================

import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  loading?: boolean;
}

export function CommentInput({ onSubmit, loading = false }: CommentInputProps) {
  const [value, setValue] = useState('');

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Yorum yaz..."
        placeholderTextColor={colors.textMuted}
        multiline
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSend}
        disabled={!value.trim() || loading}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="send"
          size={18}
          color={value.trim() ? '#FFFFFF' : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: colors.paperRaised,
    color: colors.ink,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.seal,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
