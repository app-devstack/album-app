import db from '@/db';
import { albums, photos } from '@/db/schema';
import {
  DEFAULT_ALBUM_SORT_ORDER,
  type AlbumSortOrder,
} from '@/lib/album-sort-order';
import { asc, desc, eq, isNotNull, or } from 'drizzle-orm';

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
