import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Memo } from '@/db/schema';

// Query Keys
export const memoKeys = {
  all: ['memos'] as const,
  lists: (albumId: string) => [...memoKeys.all, 'list', albumId] as const,
};

// Fetchers
const getMemos = async (albumId: string): Promise<Memo[]> => {
  const res = await api.albums[':albumId'].memos.$get({ param: { albumId } });
  if (!res.ok) {
    throw new Error('Failed to fetch memos');
  }
  return res.json();
};

const createMemo = async (input: {
  albumId: string;
  body: string;
  mood?: string | null;
}): Promise<Memo> => {
  const { albumId, ...memoData } = input;
  const res = await api.albums[':albumId'].memos.$post({
    param: { albumId },
    json: memoData,
  });
  if (!res.ok) {
    throw new Error('Failed to create memo');
  }
  return res.json();
};

const updateMemo = async ({
  id,
  ...memoData
}: Partial<Memo> & { id: string }): Promise<Memo> => {
  const res = await api.memos[':id'].$put({ param: { id }, json: memoData });
  if (!res.ok) {
    throw new Error('Failed to update memo');
  }
  return res.json();
};

const deleteMemo = async (id: string): Promise<{ message: string }> => {
  const res = await api.memos[':id'].$delete({ param: { id } });
  if (!res.ok) {
    throw new Error('Failed to delete memo');
  }
  return res.json();
};

// Hooks
export const useMemos = (albumId: string) => {
  return useQuery({
    queryKey: memoKeys.lists(albumId),
    queryFn: () => getMemos(albumId),
    enabled: !!albumId,
  });
};

export const useCreateMemo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMemo,
    onSuccess: (newMemo) => {
      queryClient.invalidateQueries({
        queryKey: memoKeys.lists(newMemo.albumId),
      });
    },
  });
};

export const useUpdateMemo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMemo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: memoKeys.lists(data.albumId) });
    },
  });
};

export const useDeleteMemo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMemo,
    onSuccess: (data, memoId) => {
      // Invalidate all memo lists to reflect changes
      queryClient.invalidateQueries({ queryKey: memoKeys.all });
    },
  });
};
