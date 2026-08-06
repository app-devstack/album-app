import db from '@/db';
import {
  albums,
  groupMembers,
  photos,
  type Album,
  type Photo,
} from '@/db/schema';
import {
  DEFAULT_ALBUM_SORT_ORDER,
  type AlbumSortOrder,
} from '@/lib/album-sort-order';
import { and, asc, count, desc, eq, isNotNull, or } from 'drizzle-orm';

/** 一覧 API で返す1件分のアルバム（最新写真・枚数付き）。 */
export type AlbumListItem = Album & {
  latestPhoto: Photo | null;
  photoCount: number;
};

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
 * 指定グループに属するアルバム一覧を取得する（最新写真・枚数付き）。
 */
export async function getAllAlbums(
  groupId: string,
  sort: AlbumSortOrder = DEFAULT_ALBUM_SORT_ORDER
): Promise<AlbumListItem[]> {
  const orderBy =
    sort === 'created_asc' ? [asc(albums.createdAt)] : [desc(albums.createdAt)];

  const albumRows = await db.query.albums.findMany({
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

  const photoCountRows = await db
    .select({
      albumId: photos.albumId,
      photoCount: count(),
    })
    .from(photos)
    .innerJoin(albums, eq(photos.albumId, albums.id))
    .where(eq(albums.groupId, groupId))
    .groupBy(photos.albumId);

  const photoCountByAlbumId = new Map(
    photoCountRows.map((row) => [row.albumId, row.photoCount])
  );

  return albumRows.map(({ photos: latestPhotos, ...album }) => ({
    ...album,
    latestPhoto: latestPhotos[0] ?? null,
    photoCount: photoCountByAlbumId.get(album.id) ?? 0,
  }));
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
