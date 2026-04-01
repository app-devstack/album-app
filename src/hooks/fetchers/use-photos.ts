import { NewPhoto, Photo } from '@/db/schema';
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const photoKeys = {
  all: ['photos'] as const,
  lists: (albumId: string) => [...photoKeys.all, 'list', albumId] as const,
};

// Fetchers
const getPhotos = async (albumId: string): Promise<Photo[]> => {
  const res = await api.photos.album[':albumId'].$get({
    param: { albumId },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch photos');
  }
  return res.json();
};

interface CreatePhotoPayload extends Omit<NewPhoto, 'id' | 'addedAt' | 'url'> {
  file: File;
}

const createPhoto = async ({
  albumId,
  file,
  ...photoData
}: CreatePhotoPayload): Promise<Photo> => {
  // 1. Get a signed URL from the API
  const { signedUrl, key } = await api.photos.album[':albumId']['upload-url']
    .$post({
      param: { albumId },
      json: {
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      },
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to get signed URL');
      return res.json();
    });

  // 2. Upload the file to R2 using the signed URL
  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!uploadRes.ok) {
    throw new Error('Failed to upload file to storage');
  }

  // 3. Save photo metadata to the database (URL will be generated from R2 key on server)
  const res = await api.photos.album[':albumId'].$post({
    param: { albumId },
    json: { ...photoData, r2Key: key },
  });
  if (!res.ok) {
    throw new Error('Failed to create photo');
  }
  return res.json();
};

const deletePhoto = async (id: string): Promise<{ message: string }> => {
  const res = await api.photos[':id'].$delete({ param: { id } });
  if (!res.ok) {
    throw new Error('Failed to delete photo');
  }
  return res.json();
};

// Hooks
export const usePhotos = (albumId: string) => {
  return useQuery({
    queryKey: photoKeys.lists(albumId),
    queryFn: () => getPhotos(albumId),
    enabled: !!albumId,
  });
};

export const useCreatePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPhoto,
    onSuccess: (newPhoto) => {
      queryClient.invalidateQueries({
        queryKey: photoKeys.lists(newPhoto.albumId),
      });
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePhoto,
    onSuccess: (data, photoId) => {
      // Invalidate all album lists to reflect photo count changes
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      // Optionally, invalidate specific album detail if photo count is displayed there
      // queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
    },
  });
};
