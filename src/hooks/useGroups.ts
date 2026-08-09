// =============================================================================
// Ders Defteri — useGroups Hook
// =============================================================================

import { useGroupStore } from '../store/groupStore';

export function useGroups() {
  const groups = useGroupStore((s) => s.groups);
  const members = useGroupStore((s) => s.members);
  const status = useGroupStore((s) => s.status);
  const error = useGroupStore((s) => s.error);
  const fetchGroups = useGroupStore((s) => s.fetchGroups);
  const createGroup = useGroupStore((s) => s.createGroup);
  const updateGroup = useGroupStore((s) => s.updateGroup);
  const deleteGroup = useGroupStore((s) => s.deleteGroup);
  const fetchMembers = useGroupStore((s) => s.fetchMembers);
  const addMember = useGroupStore((s) => s.addMember);
  const removeMember = useGroupStore((s) => s.removeMember);

  return {
    groups,
    members,
    status,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchMembers,
    addMember,
    removeMember,
    isLoading: status === 'loading',
  };
}
