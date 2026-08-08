// =============================================================================
// Ders Defteri — useLessons Hook
// =============================================================================

import { useLessonStore } from '../store/lessonStore';

export function useLessons() {
  const lessons = useLessonStore((s) => s.lessons);
  const status = useLessonStore((s) => s.status);
  const error = useLessonStore((s) => s.error);
  const fetchLessonsForStudent = useLessonStore((s) => s.fetchLessonsForStudent);
  const addLesson = useLessonStore((s) => s.addLesson);
  const updateLessonStatus = useLessonStore((s) => s.updateLessonStatus);
  const deleteLesson = useLessonStore((s) => s.deleteLesson);
  const getLessonsForStudent = useLessonStore((s) => s.getLessonsForStudent);

  return {
    lessons,
    status,
    error,
    fetchLessonsForStudent,
    addLesson,
    updateLessonStatus,
    deleteLesson,
    getLessonsForStudent,
    isLoading: status === 'loading',
  };
}
