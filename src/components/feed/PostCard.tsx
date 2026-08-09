// =============================================================================
// Ders Defteri — PostCard Bileşeni
// =============================================================================

import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { PostWithMeta } from '../../types/database';
import { colors, radius, spacing } from '../../theme';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

interface PostCardProps {
  post: PostWithMeta;
  teacherName: string;
  onToggleLike: () => void;
  onOpenComments: () => void;
}

export function PostCard({ post, teacherName, onToggleLike, onOpenComments }: PostCardProps) {
  const initials = getInitials(teacherName);
  const formattedDate = format(parseISO(post.created_at), 'dd MMMM yyyy HH:mm', { locale: tr });
  const audienceLabel = post.groups ? post.groups.name : 'Herkese Açık';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.teacherName}>
            {teacherName} <Text style={styles.teacherRole}>· Öğretmen</Text>
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <View style={styles.audienceBadge}>
          <MaterialCommunityIcons
            name={post.groups ? 'account-group' : 'earth'}
            size={12}
            color={colors.seal}
          />
          <Text style={styles.audienceText}>{audienceLabel}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {post.video_url ? (
        <TouchableOpacity
          style={styles.videoChip}
          onPress={() => Linking.openURL(post.video_url as string)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="play-circle-outline" size={18} color={colors.seal} />
          <Text style={styles.videoChipText} numberOfLines={1}>
            {post.video_url}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={onToggleLike} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={post.liked_by_me ? 'heart' : 'heart-outline'}
            size={20}
            color={post.liked_by_me ? colors.sealDeep : colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.like_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onOpenComments} activeOpacity={0.7}>
          <MaterialCommunityIcons name="comment-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>{post.comment_count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs + 2,
    padding: spacing.lg,
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm + 2,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  teacherRole: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.sealSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexShrink: 0,
  },
  audienceText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.sealDeep,
  },
  content: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
  },
  videoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.sealSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  videoChipText: {
    flex: 1,
    fontSize: 12,
    color: colors.sealDeep,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
