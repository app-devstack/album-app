import db from '@/db';
import { memos } from '@/db/schema';
import { createApp } from '@/lib/api';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod Schemas
const createMemoSchema = z.object({
  body: z.string().min(1, 'メモの内容は必須です'),
  mood: z.string().nullable().optional(),
});

const updateMemoSchema = z.object({
  body: z.string().min(1).optional(),
  mood: z.string().nullable().optional(),
});

// Memos Router
const router = createApp();

export const memosRouter = router
  .get('/album/:albumId', async (c) => {
    const albumId = c.req.param('albumId');
    const albumMemos = await db
      .select()
      .from(memos)
      .where(eq(memos.albumId, albumId))
      .all();
    return c.json(albumMemos);
  })
  .post('/album/:albumId', zValidator('json', createMemoSchema), async (c) => {
    const albumId = c.req.param('albumId');
    const body = c.req.valid('json');
    const newMemo = {
      id: uuidv7(),
      albumId: albumId,
      body: body.body,
      mood: body.mood ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.insert(memos).values(newMemo).run();
    return c.json(newMemo, 201);
  })
  .put('/:id', zValidator('json', updateMemoSchema), async (c) => {
    const id = c.req.param('id');

    const body = c.req.valid('json');
    const updatedMemo = {
      ...(body.body && { body: body.body }),
      ...(body.mood !== undefined && { mood: body.mood ?? null }),
      updatedAt: new Date().toISOString(),
    };
    await db.update(memos).set(updatedMemo).where(eq(memos.id, id)).run();
    const result = await db.select().from(memos).where(eq(memos.id, id)).get();
    return c.json(result);
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    await db.delete(memos).where(eq(memos.id, id)).run();
    return c.json({ message: 'Memo deleted' }, 200);
  });
