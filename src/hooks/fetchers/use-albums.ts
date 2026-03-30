import { Album } from '@/db/schema';
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const albumKeys = {
  all: ['albums'] as const,
  lists: (groupId: string) => [...albumKeys.all, 'list', groupId] as const,
  detail: (id: string) => [...albumKeys.all, 'detail', id] as const,
};

type CreateAlbumPayload = {
  id: string;
  title: string;
  type: 'personal' | 'family';
  coverUrl: string;
  createdBy: string;
  groupId: string;
  memberName?: string | null;
  memberAvatar?: string | null;
  sharedWith?: string[] | null;
  location?: string | null;
  createdAt: string;
};

// Fetchers
const getAlbums = async (groupId: string) => {
  const res = await api.albums.$get({ query: { groupId } });
  if (!res.ok) {
    throw new Error('Failed to fetch albums');
  }
  return res.json();
};

const getAlbum = async (id: string) => {
  const res = await api.albums[':id'].$get({ param: { id } });
  if (!res.ok) {
    throw new Error('Failed to fetch album');
  }
  return res.json();
};

const createAlbum = async (newAlbum: CreateAlbumPayload) => {
  const res = await api.albums.$post({ json: newAlbum });
  if (!res.ok) {
    throw new Error('Failed to create album');
  }
  return res.json() as Promise<Album>;
};

const updateAlbum = async ({
  id,
  ...albumData
}: Partial<Album> & { id: string }) => {
  const res = await api.albums[':id'].$put({ param: { id }, json: albumData });
  if (!res.ok) {
    throw new Error('Failed to update album');
  }
  return res.json();
};

const deleteAlbum = async (id: string): Promise<{ message: string }> => {
  const res = await api.albums[':id'].$delete({ param: { id } });
  if (!res.ok) {
    throw new Error('Failed to delete album');
  }
  return res.json();
};

// Hooks
export const useAlbums = (groupId: string) => {
  return useQuery({
    queryKey: albumKeys.lists(groupId),
    queryFn: () => getAlbums(groupId),
    enabled: !!groupId,
  });
};

export const useAlbum = (id: string) => {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => getAlbum(id),
    enabled: !!id,
  });
};

export const useCreateAlbum = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists(groupId) });
    },
  });
};

export const useUpdateAlbum = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAlbum,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists(groupId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(data.id) });
    },
  });
};

export const useDeleteAlbum = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists(groupId) });
    },
  });
};
