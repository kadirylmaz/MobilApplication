// =============================================================================
// Ders Defteri — Ana Sayfa (Feed) Screen
// =============================================================================

import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Modal, Portal, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/hooks/useAuth';
import { usePosts } from '../../../src/hooks/usePosts';
import { PostCard } from '../../../src/components/feed/PostCard';
import { CommentList } from '../../../src/components/feed/CommentList';
import { CommentInput } from '../../../src/components/feed/CommentInput';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingOverlay } from '../../../src/components/ui/LoadingOverlay';
import type { PostWithMeta } from '../../../src/types/database';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { teacher } = useAuth();
  const { posts, comments, isLoading, fetchFeed, toggleLike, fetchComments, addComment } =
    usePosts();
  const [activePost, setActivePost] = useState<PostWithMeta | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  function handleOpenComments(post: PostWithMeta) {
    setActivePost(post);
    fetchComments(post.id);
  }

  async function handleAddComment(content: string) {
    if (!activePost) return;
    await addComment(activePost.id, content);
  }

  const teacherName = teacher?.full_name ?? 'Öğretmen';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ana Sayfa</Text>
          <Text style={styles.headerSubtitle}>{posts.length} ileti</Text>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            teacherName={teacherName}
            onToggleLike={() => toggleLike(item.id)}
            onOpenComments={() => handleOpenComments(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="post-outline"
              title="Henüz ileti yok"
              subtitle="Öğrenci ve velilerinizle paylaşım yapmak için + butonuna tıklayın"
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(tabs)/home/post-new')} color="#FFFFFF" />

      <Portal>
        <Modal
          visible={activePost !== null}
          onDismiss={() => setActivePost(null)}
          style={styles.modalWrapper}
          contentContainerStyle={styles.commentsSheet}
        >
          <View style={styles.handle} />
          <Text style={styles.commentsTitle}>Yorumlar</Text>
          <FlatList
            data={activePost ? comments[activePost.id] ?? [] : []}
            keyExtractor={(item) => item.id}
            renderItem={() => null}
            ListHeaderComponent={
              <CommentList
                comments={activePost ? comments[activePost.id] ?? [] : []}
                authorName={teacherName}
              />
            }
            style={styles.commentsList}
          />
          <CommentInput onSubmit={handleAddComment} />
        </Modal>
      </Portal>

      <LoadingOverlay visible={isLoading && posts.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    backgroundColor: colors.paperRaised,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
  },
  headerSubtitle: {
    ...typography.bodySecondary,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: spacing.md,
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: colors.seal,
    borderRadius: radius.lg,
    shadowColor: colors.seal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  modalWrapper: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  commentsSheet: {
    backgroundColor: colors.paperRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: '75%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  commentsTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  commentsList: {
    flexGrow: 0,
  },
});
