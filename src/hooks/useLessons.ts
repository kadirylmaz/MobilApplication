// =============================================================================
// Ders Defteri — useLessons Hook
// =============================================================================

import { useLessonStore } from '../store/lessonStore';

export function useLessons() {
  const lessons = useLessonStore((s) => s.lessons);
  const status = useLessonStore((s) => s.status);
  const error = useLessonStore((s) => s.error);
  const fetchLessonsForStudent = useLessonStore((s) => s.fetchLessonsForStudent);
  const fetchLessonsInRange = useLessonStore((s) => s.fetchLessonsInRange);
  const addLesson = useLessonStore((s) => s.addLesson);
  const updateLesson = useLessonStore((s) => s.updateLesson);
  const updateLessonStatus = useLessonStore((s) => s.updateLessonStatus);
  const compensateLesson = useLessonStore((s) => s.compensateLesson);
  const deleteLesson = useLessonStore((s) => s.deleteLesson);
  const getLessonsForStudent = useLessonStore((s) => s.getLessonsForStudent);

  return {
    lessons,
    status,
    error,
    fetchLessonsForStudent,
    fetchLessonsInRange,
    addLesson,
    updateLesson,
    updateLessonStatus,
    compensateLesson,
    deleteLesson,
    getLessonsForStudent,
    isLoading: status === 'loading',
  };
}
