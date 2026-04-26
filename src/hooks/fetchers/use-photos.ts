import { NewPhoto, Photo } from '@/db/schema';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { generateThumbnail } from '@/lib/thumbnail';
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
  const fileSize = (file.size / 1024 / 1024).toFixed(2);
  const mediaType = photoData.mediaType === 'video' ? '動画' : '画像';
  const isVideo = photoData.mediaType === 'video';

  // 1. 動画の場合はサムネイル生成
  let thumbnailR2Key: string | undefined;
  if (isVideo) {
    try {
      const startThumb = Date.now();
      const { blob } = await generateThumbnail(file);

      // サムネイル用のPresigned URL取得
      const thumbnailFile = new File([blob], `thumb_${file.name}.jpg`, {
        type: 'image/jpeg',
      });
      const { signedUrl: thumbSignedUrl, key: thumbKey } =
        await api.photos.album[':albumId']['upload-url']
          .$post({
            param: { albumId },
            json: {
              filename: thumbnailFile.name,
              contentType: thumbnailFile.type,
              fileSize: thumbnailFile.size,
            },
          })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to get thumbnail signed URL');
            return res.json();
          });

      // サムネイルをR2にアップロード
      const thumbUploadRes = await fetch(thumbSignedUrl, {
        method: 'PUT',
        body: thumbnailFile,
        headers: { 'Content-Type': thumbnailFile.type },
      });
      if (!thumbUploadRes.ok) {
        throw new Error('Failed to upload thumbnail to storage');
      }

      thumbnailR2Key = thumbKey;
    } catch (error) {
      console.error('Thumbnail generation/upload failed:', error);
    }
  }

  // 2. Get a signed URL from the API
  const startSignedUrl = Date.now();
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

  // 3. Upload the file to R2 using the signed URL
  const startUpload = Date.now();
  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!uploadRes.ok) {
    throw new Error('Failed to upload file to storage');
  }

  // 4. Save photo metadata to the database (URL will be generated from R2 key on server)
  const res = await api.photos.album[':albumId'].$post({
    param: { albumId },
    json: { ...photoData, r2Key: key, thumbnailR2Key },
  });
  if (!res.ok) {
    throw new Error('Failed to create photo');
  }
  const newPhoto = await res.json();

  return newPhoto;
};

const deletePhoto = async (id: string): Promise<{ message: string }> => {
  const res = await api.photos[':id'].$delete({ param: { id } });
  if (!res.ok) {
    throw new Error('Failed to delete photo');
  }
  return res.json();
};

interface RegenerateThumbnailPayload {
  photoId: string;
  albumId: string;
  videoUrl: string;
}

const regenerateThumbnail = async ({
  photoId,
  albumId,
  videoUrl,
}: RegenerateThumbnailPayload): Promise<Photo> => {
  // R2から動画をダウンロード
  const startDownload = Date.now();
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error('動画のダウンロードに失敗しました');
  }
  const videoBlob = await videoResponse.blob();
  const videoFile = new File([videoBlob], 'video.mp4', {
    type: videoBlob.type,
  });

  // サムネイル生成
  const startThumb = Date.now();
  const { blob } = await generateThumbnail(videoFile);

  // サムネイル用のPresigned URL取得
  const thumbnailFile = new File(
    [blob],
    `thumb_regenerated_${Date.now()}.jpg`,
    {
      type: 'image/jpeg',
    }
  );
  const { signedUrl, key } = await api.photos.album[':albumId']['upload-url']
    .$post({
      param: { albumId },
      json: {
        filename: thumbnailFile.name,
        contentType: thumbnailFile.type,
        fileSize: thumbnailFile.size,
      },
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to get thumbnail signed URL');
      return res.json();
    });

  // サムネイルをR2にアップロード
  const startUpload = Date.now();
  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    body: thumbnailFile,
    headers: { 'Content-Type': thumbnailFile.type },
  });
  if (!uploadRes.ok) {
    throw new Error('Failed to upload thumbnail to storage');
  }

  // DBを更新
  const res = await api.photos[':id'].thumbnail.$patch({
    param: { id: photoId },
    json: { thumbnailR2Key: key },
  });
  if (!res.ok) {
    throw new Error('Failed to update thumbnail');
  }

  const updatedPhoto = await res.json();

  toast({
    title: '🎉 サムネイル再生成完了',
    description: '新しいサムネイルが設定されました',
  });

  return updatedPhoto;
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

export const useRegenerateThumbnail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: regenerateThumbnail,
    onSuccess: (updatedPhoto) => {
      queryClient.invalidateQueries({
        queryKey: photoKeys.lists(updatedPhoto.albumId),
      });
    },
  });
};
