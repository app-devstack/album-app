import type { Album, Photo } from '@/db/schema';

/**
 * アルバムカード・ヘッダ用の画像 src。
 * @description カスタム cover 時は `cover-optimized` の URL が ID 固定のため応答キャッシュと噛み合わない。そのため `updatedAt` をクエリに含めキャッシュバストする。
 */
export function albumCoverImageSrc(
  album: Album & { latestPhoto?: Photo | null }
): string | null {
  const customUrl = album.coverUrl.trim();

  if (customUrl.length > 0) {
    const v = encodeURIComponent(album.updatedAt);
    return `/api/albums/${album.id}/cover-optimized?mode=thumb&v=${v}`;
  }

  // 最新写真があればそれをアルバムカバーとして使用
  if (album.latestPhoto) {
    return `/api/photos/${album.latestPhoto.id}/optimized?mode=thumb`;
  }

  return null;
}

/** アルバムの coverUrl に保存する URL（動画はサムネがあればそれを使う） */
export function photoUrlForAlbumCover(photo: Photo): string {
  if (photo.mediaType === 'video' && photo.thumbnailUrl) {
    return `/api/photos/${photo.id}/video-thumbnail`;
  }
  return photo.url;
}
