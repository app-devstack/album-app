import db from '@/db';
import { albums, photos } from '@/db/schema';
import { createApp } from '@/lib/api';
import { zValidator } from '@hono/zod-validator';
import { desc, eq, isNotNull, or } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod Schemas
const createAlbumSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  type: z.enum(['personal', 'family']).default('personal'),
  createdBy: z.string().default('自分'),
  memberName: z.string().nullable().optional(),
  memberAvatar: z.string().nullable().optional(),
  sharedWith: z.array(z.string()).nullable().optional(),
  location: z.string().nullable().optional(),
});

const updateAlbumSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['personal', 'family']).optional(),
  memberName: z.string().nullable().optional(),
  memberAvatar: z.string().nullable().optional(),
  sharedWith: z.array(z.string()).nullable().optional(),
  location: z.string().nullable().optional(),
});

/**
 * 全アルバムを、表示可能な最新写真（画像 or サムネイルあり動画）付きで取得する
 */
async function getAlbumsWithLatestPhoto() {
  return await db.query.albums.findMany({
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
 * 指定アルバムを、表示可能な最新写真（画像 or サムネイルあり動画）付きで取得する
 */
async function getAlbumWithLatestPhoto(id: string) {
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

// Albums Router
const router = createApp();

export const albumsRouter = router
  .get('/', async (c) => {
    const albumsWithLatest = await getAlbumsWithLatestPhoto();
    return c.json(
      albumsWithLatest.map(({ photos, ...alb }) => ({
        ...alb,
        latestPhoto: photos[0] ?? null,
      }))
    );
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await getAlbumWithLatestPhoto(id);
    if (!result) {
      return c.json({ message: 'Album not found' }, 404);
    }
    const { photos: ph, ...alb } = result;
    return c.json({ ...alb, latestPhoto: ph[0] ?? null });
  })
  .post('/', zValidator('json', createAlbumSchema), async (c) => {
    const body = c.req.valid('json');
    const newAlbum = {
      ...body,
      id: uuidv7(),
      coverUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.insert(albums).values(newAlbum).run();
    return c.json(newAlbum, 201);
  })
  .put('/:id', zValidator('json', updateAlbumSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const result = await db
      .update(albums)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(albums.id, id))
      .run();

    const isUpdated = result.success;

    if (!isUpdated) {
      return c.json({ message: 'Album not found or update failed' }, 404);
    }

    const album = await getAlbumWithLatestPhoto(id);

    const { photos: _, ...alb } = album!;
    const latestPhoto = album?.photos[0] ?? null;
    return c.json({ ...alb, latestPhoto });
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    await db.delete(albums).where(eq(albums.id, id)).run();
    return c.json({ message: 'Album deleted' }, 200);
  });
