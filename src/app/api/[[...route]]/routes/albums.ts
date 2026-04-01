import db from '@/db';
import { albums, groupMembers, NewAlbum, photos } from '@/db/schema';
import { createApp } from '@/lib/api';
import { getAlbumById, getAllAlbums } from '@/lib/service/albums';
import { getSession } from '@/lib/service/auth';
import { zValidator } from '@hono/zod-validator';
import { and, eq, or } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod Schemas
const createAlbumSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  type: z.enum(['personal', 'family']).default('personal'),
  location: z.string().nullable().optional(),
  groupId: z.string().min(1, 'グループIDは必須です'),
});

const updateAlbumSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['personal', 'family']).optional(),
  memberName: z.string().nullable().optional(),
  memberAvatar: z.string().nullable().optional(),
  sharedWith: z.array(z.string()).nullable().optional(),
  location: z.string().nullable().optional(),
  coverUrl: z.union([z.literal(''), z.url()]).optional(),
});

export type CreateAlbumSchema = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumSchema = z.infer<typeof updateAlbumSchema>;

// Albums Router
const router = createApp();

export const albumsRouter = router
  .get('/', async (c) => {
    const session = await getSession(c.req.raw.headers);
    if (!session) return c.json({ error: 'Unauthorized' }, 401);

    const groupId = c.req.query('groupId');
    if (!groupId) return c.json({ error: 'groupId is required' }, 400);

    // グループメンバーかどうかを確認
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      ),
    });
    if (!membership) return c.json({ error: 'Forbidden' }, 403);

    const albumsWithLatest = await getAllAlbums(groupId);
    return c.json(
      albumsWithLatest.map(({ photos, ...alb }) => ({
        ...alb,
        latestPhoto: photos[0] ?? null,
      }))
    );
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await getAlbumById(id);
    if (!result) {
      return c.json({ message: 'Album not found' }, 404);
    }
    const { photos: ph, ...alb } = result;
    return c.json({ ...alb, latestPhoto: ph[0] ?? null });
  })
  .post('/', zValidator('json', createAlbumSchema), async (c) => {
    const session = await getSession(c.req.raw.headers);
    if (!session) return c.json({ error: 'Unauthorized' }, 401);
    const body = c.req.valid('json');

    // グループメンバーかどうかを確認
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, body.groupId),
        eq(groupMembers.userId, session.user.id)
      ),
    });
    if (!membership) return c.json({ error: 'Forbidden' }, 403);

    const newAlbum = {
      ...body,
      id: uuidv7(),
      coverUrl: '',
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies NewAlbum;
    await db.insert(albums).values(newAlbum).run();
    return c.json(newAlbum, 201);
  })
  .put('/:id', zValidator('json', updateAlbumSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');

    if (body.coverUrl !== undefined && body.coverUrl !== '') {
      const match = await db.query.photos.findFirst({
        where: and(
          eq(photos.albumId, id),
          or(
            eq(photos.url, body.coverUrl),
            eq(photos.thumbnailUrl, body.coverUrl)
          )
        ),
      });
      if (!match) {
        return c.json(
          {
            error:
              'coverUrl must match url or thumbnailUrl of a photo in this album',
          },
          400
        );
      }
    }

    const result = await db
      .update(albums)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(albums.id, id))
      .run();

    const isUpdated = result.success;

    if (!isUpdated) {
      return c.json({ message: 'Album not found or update failed' }, 404);
    }

    const album = await getAlbumById(id);

    const { photos: _, ...alb } = album!;
    const latestPhoto = album?.photos[0] ?? null;
    return c.json({ ...alb, latestPhoto });
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    await db.delete(albums).where(eq(albums.id, id)).run();
    return c.json({ message: 'Album deleted' }, 200);
  });
