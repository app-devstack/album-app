import { Album, NewAlbum } from '@/db/schema';
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  detail: (id: string) => [...albumKeys.all, 'detail', id] as const,
};

// Fetchers
const getAlbums = async () => {
  const res = await api.albums.$get();
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

const createAlbum = async (newAlbum: NewAlbum) => {
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
export const useAlbums = () => {
  return useQuery({
    queryKey: albumKeys.lists(),
    queryFn: getAlbums,
  });
};

export const useAlbum = (id: string) => {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => getAlbum(id),
    enabled: !!id,
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
    },
  });
};

export const useUpdateAlbum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAlbum,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(data.id) });
    },
  });
};

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
    },
  });
};
