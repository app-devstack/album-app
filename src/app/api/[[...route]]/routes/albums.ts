import db from '@/db';
import { albums } from '@/db/schema';
import { createApp } from '@/lib/api';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod Schemas
const createAlbumSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  type: z.enum(['personal', 'family']).default('personal'),
  coverUrl: z.string().default(''),
  createdBy: z.string().default('自分'),
  memberName: z.string().nullable().optional(),
  memberAvatar: z.string().nullable().optional(),
  sharedWith: z.array(z.string()).nullable().optional(),
  location: z.string().nullable().optional(),
});

const updateAlbumSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['personal', 'family']).optional(),
  coverUrl: z.string().optional(),
  memberName: z.string().nullable().optional(),
  memberAvatar: z.string().nullable().optional(),
  sharedWith: z.array(z.string()).nullable().optional(),
  location: z.string().nullable().optional(),
});

// Albums Router
const router = createApp();

export const albumsRouter = router
  .get('/', async (c) => {
    const allAlbums = await db.select().from(albums).all();
    return c.json(allAlbums);
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const album = await db.select().from(albums).where(eq(albums.id, id)).get();
    if (!album) {
      return c.json({ message: 'Album not found' }, 404);
    }
    return c.json(album);
  })
  .post('/', zValidator('json', createAlbumSchema), async (c) => {
    const body = c.req.valid('json');
    const newAlbum = {
      ...body,
      id: uuidv7(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.insert(albums).values(newAlbum).run();
    return c.json(newAlbum, 201);
  })
  .put('/:id', zValidator('json', updateAlbumSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const updatedAlbum = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await db.update(albums).set(updatedAlbum).where(eq(albums.id, id)).run();
    const result = await db
      .select()
      .from(albums)
      .where(eq(albums.id, id))
      .get();
    return c.json(result);
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    await db.delete(albums).where(eq(albums.id, id)).run();
    return c.json({ message: 'Album deleted' }, 200);
  });
