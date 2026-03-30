import db from '@/db';
import { groupInviteTokens, groupMembers, groups } from '@/db/schema';
import { createApp } from '@/lib/api';
import { getSession } from '@/lib/service/auth';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

const createGroupSchema = z.object({
  name: z.string().min(1),
  coverUrl: z.string().optional(),
});

const router = createApp();

export const groupsRouter = router
  /**
   * GET /api/groups
   * ログインユーザーが所属するグループ一覧を返す
   */
  .get('/', async (c) => {
    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = session.user.id;
    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, userId),
      with: {
        group: true,
      },
    });

    return c.json(members.map((m) => ({ ...m.group, role: m.role })));
  })
  /**
   * POST /api/groups
   * グループを新規作成し、作成者を owner として group_members に追加する
   */
  .post('/', zValidator('json', createGroupSchema), async (c) => {
    const body = c.req.valid('json');
    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const createdBy = session.user.id;

    const newGroup = {
      id: uuidv7(),
      name: body.name,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(groups).values(newGroup).run();
    await db
      .insert(groupMembers)
      .values({
        groupId: newGroup.id,
        userId: createdBy,
        role: 'owner',
        joinedAt: new Date(),
      })
      .run();

    return c.json(newGroup, 201);
  })
  /**
   * GET /api/groups/:groupId/invite-token
   * グループのアクティブな招待トークンを返す。なければ新規作成。
   */
  .get('/:groupId/invite-token', async (c) => {
    const groupId = c.req.param('groupId');
    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const createdBy = session.user.id;

    const existing = await db.query.groupInviteTokens.findFirst({
      where: and(
        eq(groupInviteTokens.groupId, groupId),
        eq(groupInviteTokens.isRevoked, false)
      ),
    });

    if (existing) {
      return c.json({ token: existing.token, groupId });
    }

    const newToken = {
      id: uuidv7(),
      groupId,
      token: uuidv7(),
      createdBy,
      expiresAt: null as Date | null,
      isRevoked: false,
      createdAt: new Date(),
    };
    await db.insert(groupInviteTokens).values(newToken).run();

    return c.json({ token: newToken.token, groupId });
  })
  /**
   * DELETE /api/groups/:groupId/invite-token
   * アクティブな招待トークンを失効させる
   */
  .delete('/:groupId/invite-token', async (c) => {
    const groupId = c.req.param('groupId');
    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    await db
      .update(groupInviteTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(groupInviteTokens.groupId, groupId),
          eq(groupInviteTokens.isRevoked, false)
        )
      )
      .run();

    return c.json({ message: 'Token revoked' });
  });
