// =============================================================================
// Ders Defteri — Yeni İleti Screen
// =============================================================================

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { postSchema } from '../../../src/validation/postSchemas';
import { usePosts } from '../../../src/hooks/usePosts';
import { useGroups } from '../../../src/hooks/useGroups';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppButton } from '../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../src/components/ui/ErrorMessage';
import { HeaderBackButton } from '../../../src/components/ui/HeaderBackButton';
import { PostComposer } from '../../../src/components/feed/PostComposer';
import { colors } from '../../../src/theme';

export default function NewPostScreen() {
  const router = useRouter();
  const { createPost, isLoading, error } = usePosts();
  const { groups, fetchGroups } = useGroups();

  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function handleSubmit() {
    setContentError(null);
    setVideoUrlError(null);

    const result = postSchema.safeParse({ content, video_url: videoUrl, group_id: groupId });
    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === 'content') setContentError(issue.message);
        if (issue.path[0] === 'video_url') setVideoUrlError(issue.message);
      }
      return;
    }

    try {
      await createPost({ content, video_url: videoUrl, group_id: groupId });
      router.back();
    } catch {
      // error is set in the store
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni İleti', headerLeft: () => <HeaderBackButton /> }} />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.form}>
          <PostComposer
            content={content}
            onChangeContent={setContent}
            contentError={contentError}
            videoUrl={videoUrl}
            onChangeVideoUrl={setVideoUrl}
            videoUrlError={videoUrlError}
            groups={groups}
            selectedGroupId={groupId}
            onSelectGroup={setGroupId}
          />

          <ErrorMessage message={error} />

          <AppButton
            label="Paylaş"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: colors.paper,
  },
  form: {
    gap: 4,
  },
  submitButton: {
    marginTop: 16,
  },
});
