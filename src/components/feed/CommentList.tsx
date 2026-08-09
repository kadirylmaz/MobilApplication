// =============================================================================
// Ders Defteri — CommentList Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { PostCommentRow } from '../../types/database';
import { colors, radius, spacing } from '../../theme';

interface CommentListProps {
  comments: PostCommentRow[];
  authorName: string;
}

export function CommentList({ comments, authorName }: CommentListProps) {
  if (comments.length === 0) {
    return <Text style={styles.empty}>Henüz yorum yok.</Text>;
  }

  return (
    <View style={styles.container}>
      {comments.map((comment) => (
        <View key={comment.id} style={styles.commentRow}>
          <View style={styles.bubble}>
            <Text style={styles.author}>{authorName}</Text>
            <Text style={styles.content}>{comment.content}</Text>
          </View>
          <Text style={styles.date}>
            {format(parseISO(comment.created_at), 'dd MMM HH:mm', { locale: tr })}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm + 2,
  },
  empty: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  commentRow: {
    gap: 2,
  },
  bubble: {
    backgroundColor: colors.sealSoft,
    borderRadius: radius.sm + 2,
    padding: spacing.sm + 2,
  },
  author: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  content: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
