// =============================================================================
// Ders Defteri — Post (Ana Sayfa Feed) Zustand Store
// =============================================================================

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { PostCommentRow, PostWithMeta } from '../types/database';
import type { AsyncStatus, PostFormValues } from '../types/index';

interface PostState {
  posts: PostWithMeta[];
  comments: Record<string, PostCommentRow[]>; // post_id -> yorumlar
  status: AsyncStatus;
  error: string | null;
}

interface PostActions {
  fetchFeed: () => Promise<void>;
  createPost: (values: PostFormValues) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
}

type PostStore = PostState & PostActions;

async function getCurrentProfileId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Oturum bulunamadı');

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data.id;
}

export const usePostStore = create<PostStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  posts: [],
  comments: {},
  status: 'idle',
  error: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  fetchFeed: async () => {
    set({ status: 'loading', error: null });
    try {
      const profileId = await getCurrentProfileId();

      const { data, error } = await supabase
        .from('posts')
        .select('*, groups(id, name), post_likes(id, profile_id), post_comments(id)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const posts: PostWithMeta[] = (data ?? []).map((row) => {
        const raw = row as unknown as {
          post_likes: { id: string; profile_id: string }[] | null;
          post_comments: { id: string }[] | null;
        };
        const likes = raw.post_likes ?? [];
        const commentsList = raw.post_comments ?? [];
        return {
          ...(row as unknown as PostWithMeta),
          like_count: likes.length,
          comment_count: commentsList.length,
          liked_by_me: likes.some((l) => l.profile_id === profileId),
        };
      });

      set({ posts, status: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İletiler yüklenemedi';
      set({ status: 'error', error: message });
    }
  },

  createPost: async (values: PostFormValues) => {
    set({ status: 'loading', error: null });
    try {
      const { data: teacherId, error: rpcError } = await supabase.rpc('get_teacher_id');
      if (rpcError) throw rpcError;

      const { error } = await supabase.from('posts').insert({
        teacher_id: teacherId as string,
        content: values.content,
        video_url: values.video_url || null,
        group_id: values.group_id,
      });

      if (error) throw error;

      await get().fetchFeed();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İleti paylaşılamadı';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  deletePost: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;

      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        status: 'success',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İleti silinemedi';
      set({ status: 'error', error: message });
      throw err;
    }
  },

  toggleLike: async (postId: string) => {
    try {
      const profileId = await getCurrentProfileId();
      const post = get().posts.find((p) => p.id === postId);
      if (!post) return;

      if (post.liked_by_me) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('profile_id', profileId);
        if (error) throw error;

        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, liked_by_me: false, like_count: Math.max(0, p.like_count - 1) }
              : p,
          ),
        }));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, profile_id: profileId });
        if (error) throw error;

        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, liked_by_me: true, like_count: p.like_count + 1 }
              : p,
          ),
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beğeni işlemi başarısız';
      set({ error: message });
    }
  },

  fetchComments: async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set((state) => ({
        comments: { ...state.comments, [postId]: data ?? [] },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yorumlar yüklenemedi';
      set({ error: message });
    }
  },

  addComment: async (postId: string, content: string) => {
    try {
      const profileId = await getCurrentProfileId();

      const { error } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, profile_id: profileId, content });

      if (error) throw error;

      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p,
        ),
      }));

      await get().fetchComments(postId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yorum eklenemedi';
      set({ error: message });
      throw err;
    }
  },
}));
