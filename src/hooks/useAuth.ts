// =============================================================================
// Ders Defteri — useAuth Hook
// =============================================================================

import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const teacher = useAuthStore((s) => s.teacher);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const initialize = useAuthStore((s) => s.initialize);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signOut = useAuthStore((s) => s.signOut);
  const updateTeacher = useAuthStore((s) => s.updateTeacher);
  const clearError = useAuthStore((s) => s.clearError);

  return {
    user,
    teacher,
    status,
    error,
    initialize,
    signIn,
    signUp,
    signOut,
    updateTeacher,
    clearError,
    isAuthenticated: user !== null,
    isLoading: status === 'loading',
  };
}
