import db from '@/db';
import { albums, photos } from '@/db/schema';
import { desc, eq, isNotNull, or } from 'drizzle-orm';

/**
 * 指定グループに属するアルバムを取得する
 */
export async function getAllAlbums(groupId: string) {
  return await db.query.albums.findMany({
    where: eq(albums.groupId, groupId),
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
