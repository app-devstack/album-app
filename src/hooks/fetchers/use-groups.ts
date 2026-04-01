import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  detail: (id: string) => [...groupKeys.all, 'detail', id] as const,
  members: (id: string) => [...groupKeys.all, 'members', id] as const,
};

const getGroup = async (groupId: string) => {
  const res = await api.groups[':groupId'].$get({ param: { groupId } });
  if (!res.ok) {
    throw new Error('Failed to fetch group');
  }
  return res.json();
};

const getGroups = async () => {
  const res = await api.groups.$get();
  if (!res.ok) {
    throw new Error('Failed to fetch groups');
  }
  return res.json();
};

const getGroupMembers = async (groupId: string) => {
  const res = await api.groups[':groupId'].members.$get({
    param: { groupId },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch group members');
  }
  return res.json();
};

const updateGroup = async ({
  groupId,
  name,
}: {
  groupId: string;
  name: string;
}) => {
  const res = await api.groups[':groupId'].$patch({
    param: { groupId },
    json: { name },
  });
  if (!res.ok) {
    throw new Error('Failed to update group');
  }
  return res.json();
};

const updateMemberRole = async ({
  groupId,
  userId,
  role,
}: {
  groupId: string;
  userId: string;
  role: 'member' | 'editor';
}) => {
  const res = await api.groups[':groupId'].members[':userId'].$patch({
    param: { groupId, userId },
    json: { role },
  });
  if (!res.ok) {
    throw new Error('Failed to update member role');
  }
  return res.json();
};

const createGroup = async (name: string) => {
  const res = await api.groups.$post({ json: { name } });
  if (!res.ok) {
    throw new Error('Failed to create group');
  }
  return res.json();
};

export const useGroup = (groupId: string) => {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => getGroup(groupId),
    enabled: !!groupId,
  });
};

export const useGroups = () => {
  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: getGroups,
  });
};

export const useGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId,
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGroup,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMemberRole,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};
