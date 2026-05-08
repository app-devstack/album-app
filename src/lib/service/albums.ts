import db from '@/db';
import { albums, groupMembers, photos } from '@/db/schema';
import {
  DEFAULT_ALBUM_SORT_ORDER,
  type AlbumSortOrder,
} from '@/lib/album-sort-order';
import { and, asc, desc, eq, isNotNull, or } from 'drizzle-orm';

/** `canUserAccessAlbum` 判定に使うアルバム行の最小フィールド。 */
export type AlbumAccessFields = {
  groupId: string | null;
  userId: string | null;
};

/**
 * ユーザーがアルバムにアクセスできるか（グループアルバムはメンバーのみ、それ以外は作成者のみ）。
 */
export async function canUserAccessAlbum(
  userId: string,
  album: AlbumAccessFields
): Promise<boolean> {
  if (album.groupId) {
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, album.groupId),
        eq(groupMembers.userId, userId)
      ),
    });
    return !!membership;
  }
  if (album.userId == null) return false;
  return album.userId === userId;
}

/**
 * 指定グループに属するアルバムを取得する（作成日でソート）
 */
export async function getAllAlbums(
  groupId: string,
  sort: AlbumSortOrder = DEFAULT_ALBUM_SORT_ORDER
) {
  const orderBy =
    sort === 'created_asc' ? [asc(albums.createdAt)] : [desc(albums.createdAt)];

  return await db.query.albums.findMany({
    where: eq(albums.groupId, groupId),
    orderBy,
    with: {
      photos: {
        where: or(
          eq(photos.mediaType, 'image'),
          isNotNull(photos.thumbnailUrl)
        ),
        orderBy: desc(photos.addedAt),
        limit: 1,
      },
    },
  });
}

/**
 * 指定アルバム取得する
 */
export async function getAlbumById(id: string) {
  return await db.query.albums.findFirst({
    where: eq(albums.id, id),
    with: {
      photos: {
        where: or(
          eq(photos.mediaType, 'image'),
          isNotNull(photos.thumbnailUrl)
        ),
        orderBy: desc(photos.addedAt),
        limit: 1,
      },
    },
  });
}
