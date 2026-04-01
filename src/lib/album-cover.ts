import type { Album, Photo } from '@/db/schema';

/** アルバムカード・ヘッダ用の画像 src（カスタム coverUrl 優先、なければ最新1件の optimized） */
export function albumCoverImageSrc(
  album: Album & { latestPhoto?: Photo | null }
): string | null {
  const custom = album.coverUrl?.trim();
  if (custom) return custom;
  if (album.latestPhoto) {
    return `/api/photos/${album.latestPhoto.id}/optimized?mode=thumb`;
  }
  return null;
}

/** アルバムの coverUrl に保存する URL（動画はサムネがあればそれを使う） */
export function photoUrlForAlbumCover(photo: Photo): string {
  if (photo.mediaType === 'video' && photo.thumbnailUrl) {
    return photo.thumbnailUrl;
  }
  return photo.url;
}
