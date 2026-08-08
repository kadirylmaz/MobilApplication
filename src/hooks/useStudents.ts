// =============================================================================
// Ders Defteri — useStudents Hook
// =============================================================================

import { useStudentStore } from '../store/studentStore';

export function useStudents() {
  const students = useStudentStore((s) => s.students);
  const status = useStudentStore((s) => s.status);
  const error = useStudentStore((s) => s.error);
  const filters = useStudentStore((s) => s.filters);
  const filteredStudents = useStudentStore((s) => s.filteredStudents);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const addStudent = useStudentStore((s) => s.addStudent);
  const updateStudent = useStudentStore((s) => s.updateStudent);
  const setFilters = useStudentStore((s) => s.setFilters);

  return {
    students,
    status,
    error,
    filters,
    filteredStudents: filteredStudents(),
    fetchStudents,
    addStudent,
    updateStudent,
    setFilters,
    isLoading: status === 'loading',
  };
}
