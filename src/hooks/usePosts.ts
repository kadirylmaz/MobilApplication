// =============================================================================
// Ders Defteri — usePosts Hook
// =============================================================================

import { usePostStore } from '../store/postStore';

export function usePosts() {
  const posts = usePostStore((s) => s.posts);
  const comments = usePostStore((s) => s.comments);
  const status = usePostStore((s) => s.status);
  const error = usePostStore((s) => s.error);
  const fetchFeed = usePostStore((s) => s.fetchFeed);
  const createPost = usePostStore((s) => s.createPost);
  const deletePost = usePostStore((s) => s.deletePost);
  const toggleLike = usePostStore((s) => s.toggleLike);
  const fetchComments = usePostStore((s) => s.fetchComments);
  const addComment = usePostStore((s) => s.addComment);

  return {
    posts,
    comments,
    status,
    error,
    fetchFeed,
    createPost,
    deletePost,
    toggleLike,
    fetchComments,
    addComment,
    isLoading: status === 'loading',
  };
}
