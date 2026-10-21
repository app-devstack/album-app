import db from '@/db';
import {
  groupMembers,
  mediaShareLinks,
  photos,
  type Album,
  type Photo,
} from '@/db/schema';
import { canUserAccessAlbum } from '@/lib/service/albums';
import {
  createMediaShareToken,
  isMediaShareToken,
} from '@/lib/media-share-token';
import { eq } from 'drizzle-orm';

/** 公開一覧の1件。URLは含めない。 */
export interface MediaShareListItem {
  photoId: string;
  mediaType: Photo['mediaType'];
  albumId: string;
  albumTitle: string;
  createdAt: string;
}

type ShareWithPhoto = {
  token: string;
  photoId: string;
  createdAt: string;
  photo: Photo & { album: Album };
};

/**
 * 有効な限定公開をトークンで読む。
 * @param token - URL のトークン
 */
export async function findActiveShareByToken(
  token: string
): Promise<ShareWithPhoto | null> {
  if (!isMediaShareToken(token)) return null;
  const row = await db.query.mediaShareLinks.findFirst({
    where: eq(mediaShareLinks.token, token),
    with: { photo: { with: { album: true } } },
  });
  if (!row?.photo?.album) return null;
  return {
    token: row.token,
    photoId: row.photoId,
    createdAt: row.createdAt,
    photo: { ...row.photo, album: row.photo.album },
  };
}

/**
 * 写真・動画の現在の限定公開を読む。
 * @param photoId - 対象の写真または動画
 */
export async function findActiveShareByPhotoId(photoId: string) {
  return db.query.mediaShareLinks.findFirst({
    where: eq(mediaShareLinks.photoId, photoId),
  });
}

/**
 * 見られるアルバムの公開中一覧を返す。
 * @param userId - ログイン中のユーザー
 */
export async function listVisibleShares(
  userId: string
): Promise<MediaShareListItem[]> {
  const [rows, memberships] = await Promise.all([
    db.query.mediaShareLinks.findMany({
      with: { photo: { with: { album: true } } },
    }),
    db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, userId),
    }),
  ]);
  const groupIds = new Set(memberships.map((row) => row.groupId));

  return rows.flatMap((row) => {
    const album = row.photo?.album;
    if (!row.photo || !album) return [];
    const visible = album.groupId
      ? groupIds.has(album.groupId)
      : album.userId === userId;
    if (!visible) return [];
    return [
      {
        photoId: row.photo.id,
        mediaType: row.photo.mediaType,
        albumId: album.id,
        albumTitle: album.title,
        createdAt: row.createdAt,
      },
    ];
  });
}

/**
 * メンバー向けに、その写真の現在の公開トークンを返す。未公開なら null。
 * @param userId - ログイン中のユーザー
 * @param photoId - 対象の写真または動画
 */
export async function readShareForMember(
  userId: string,
  photoId: string
): Promise<
  | { ok: true; token: string | null; createdAt: string | null }
  | { ok: false; status: 403 | 404 }
> {
  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, photoId),
    with: { album: true },
  });
  if (!photo?.album) return { ok: false, status: 404 };
  if (!(await canUserAccessAlbum(userId, photo.album))) {
    return { ok: false, status: 403 };
  }
  const existing = await findActiveShareByPhotoId(photoId);
  return {
    ok: true,
    token: existing?.token ?? null,
    createdAt: existing?.createdAt ?? null,
  };
}

/**
 * 限定公開を発行する。すでに公開中なら同じトークンを返す。
 * @param userId - ログイン中のユーザー
 * @param photoId - 対象の写真または動画
 */
export async function createOrGetShare(
  userId: string,
  photoId: string
): Promise<
  | { ok: true; token: string }
  | { ok: false; status: 403 | 404 }
> {
  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, photoId),
    with: { album: true },
  });
  if (!photo?.album) return { ok: false, status: 404 };
  if (!(await canUserAccessAlbum(userId, photo.album))) {
    return { ok: false, status: 403 };
  }

  const existing = await findActiveShareByPhotoId(photoId);
  if (existing) return { ok: true, token: existing.token };

  const token = createMediaShareToken();
  try {
    await db
      .insert(mediaShareLinks)
      .values({
        token,
        photoId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      })
      .run();
  } catch {
    const raced = await findActiveShareByPhotoId(photoId);
    if (raced) return { ok: true, token: raced.token };
    return { ok: false, status: 404 };
  }

  return { ok: true, token };
}

/**
 * その写真の限定公開を破棄する。同じトークンは二度と使わない。
 * @param userId - ログイン中のユーザー
 * @param photoId - オフにする写真または動画
 */
export async function revokeShareByPhotoId(
  userId: string,
  photoId: string
): Promise<{ ok: true } | { ok: false; status: 403 | 404 }> {
  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, photoId),
    with: { album: true },
  });
  if (!photo?.album) return { ok: false, status: 404 };
  if (!(await canUserAccessAlbum(userId, photo.album))) {
    return { ok: false, status: 403 };
  }

  const existing = await findActiveShareByPhotoId(photoId);
  if (!existing) return { ok: false, status: 404 };

  await db
    .delete(mediaShareLinks)
    .where(eq(mediaShareLinks.photoId, photoId))
    .run();

  return { ok: true };
}
