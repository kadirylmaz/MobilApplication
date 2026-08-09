// =============================================================================
// Ders Defteri — PostComposer Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { GroupRow } from '../../types/database';
import { AppTextInput } from '../ui/AppTextInput';
import { colors, radius, spacing, typography } from '../../theme';

interface PostComposerProps {
  content: string;
  onChangeContent: (text: string) => void;
  contentError?: string | null;
  videoUrl: string;
  onChangeVideoUrl: (text: string) => void;
  videoUrlError?: string | null;
  groups: GroupRow[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
}

export function PostComposer({
  content,
  onChangeContent,
  contentError,
  videoUrl,
  onChangeVideoUrl,
  videoUrlError,
  groups,
  selectedGroupId,
  onSelectGroup,
}: PostComposerProps) {
  return (
    <View style={styles.container}>
      <AppTextInput
        label="Ne paylaşmak istersiniz?"
        value={content}
        onChangeText={onChangeContent}
        error={contentError}
        multiline
        numberOfLines={5}
        style={styles.contentInput}
      />

      <AppTextInput
        label="Video linki (opsiyonel)"
        value={videoUrl}
        onChangeText={onChangeVideoUrl}
        error={videoUrlError}
        placeholder="https://..."
        autoCapitalize="none"
        keyboardType="url"
      />

      <Text style={styles.sectionLabel}>Kime Görünsün?</Text>
      <View style={styles.audienceRow}>
        <TouchableOpacity
          style={[styles.audienceChip, selectedGroupId === null && styles.audienceChipActive]}
          onPress={() => onSelectGroup(null)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="earth"
            size={16}
            color={selectedGroupId === null ? '#FFFFFF' : colors.seal}
          />
          <Text
            style={[
              styles.audienceChipText,
              selectedGroupId === null && styles.audienceChipTextActive,
            ]}
          >
            Herkese Açık
          </Text>
        </TouchableOpacity>

        {groups.map((group) => {
          const active = selectedGroupId === group.id;
          return (
            <TouchableOpacity
              key={group.id}
              style={[styles.audienceChip, active && styles.audienceChipActive]}
              onPress={() => onSelectGroup(group.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={16}
                color={active ? '#FFFFFF' : colors.seal}
              />
              <Text style={[styles.audienceChipText, active && styles.audienceChipTextActive]}>
                {group.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  contentInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    ...typography.eyebrow,
    color: colors.seal,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  audienceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.sealSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  audienceChipActive: {
    backgroundColor: colors.seal,
    borderColor: colors.seal,
  },
  audienceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sealDeep,
  },
  audienceChipTextActive: {
    color: '#FFFFFF',
  },
});
