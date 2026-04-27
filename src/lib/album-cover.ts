import type { Album, Photo } from '@/db/schema';

/**
 * アルバムカード・ヘッダ用の画像 src。
 * - カスタム coverUrl あり → サーバーが元 URL を解決して最適化するアルバム API
 * - 未設定で最新写真のみ → 写真単体の optimized（従来どおり）
 */
export function albumCoverImageSrc(
  album: Album & { latestPhoto?: Photo | null }
): string | null {
  const customUrl = album.coverUrl.trim();

  // カスタム URL があればそれを優先
  if (customUrl.length > 0) {
    return `/api/albums/${album.id}/cover-optimized?mode=thumb`;
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
