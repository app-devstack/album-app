import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
};

const getGroups = async () => {
  const res = await api.groups.$get();
  if (!res.ok) {
    throw new Error('Failed to fetch groups');
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

export const useGroups = () => {
  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: getGroups,
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
