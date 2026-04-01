import db from '@/db';
import { groupInviteTokens, groupMembers, groups } from '@/db/schema';
import { createApp } from '@/lib/api';
import { isGroupAdmin } from '@/lib/group-role';
import { getSession } from '@/lib/service/auth';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

const updateGroupSchema = z.object({
  name: z.string().min(1),
});

const createGroupSchema = z.object({
  name: z.string().min(1),
  coverUrl: z.string().optional(),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['member', 'editor']),
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
   * GET /api/groups/:groupId
   * 指定グループの情報を返す
   */
  .get('/:groupId', async (c) => {
    const groupId = c.req.param('groupId');
    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const member = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      ),
      with: { group: true },
    });

    if (!member) return c.json({ error: 'Not found' }, 404);

    return c.json({ ...member.group, role: member.role });
  })
  /**
   * PATCH /api/groups/:groupId
   * グループ名を更新する（owner / editor）
   */
  .patch('/:groupId', zValidator('json', updateGroupSchema), async (c) => {
    const groupId = c.req.param('groupId');
    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const member = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      ),
    });

    if (!member) return c.json({ error: 'Not found' }, 404);
    if (!isGroupAdmin(member.role)) return c.json({ error: 'Forbidden' }, 403);

    const { name } = c.req.valid('json');
    await db
      .update(groups)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(groups.id, groupId))
      .run();

    return c.json({ id: groupId, name });
  })
  /**
   * GET /api/groups/:groupId/members
   * グループメンバー一覧をユーザー情報付きで返す
   */
  .get('/:groupId/members', async (c) => {
    const groupId = c.req.param('groupId');
    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const isMember = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      ),
    });

    if (!isMember) return c.json({ error: 'Not found' }, 404);

    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      with: { user: true },
    });

    return c.json(
      members.map((m) => ({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
      }))
    );
  })
  /**
   * PATCH /api/groups/:groupId/members/:userId
   * メンバーの role を member / editor に更新（owner / editor が実行可。owner 行は変更不可）
   */
  .patch(
    '/:groupId/members/:userId',
    zValidator('json', updateMemberRoleSchema),
    async (c) => {
      const groupId = c.req.param('groupId');
      const targetUserId = c.req.param('userId');
      const session = await getSession(c.req.raw.headers);
      if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

      const caller = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, session.user.id)
        ),
      });

      if (!caller) return c.json({ error: 'Not found' }, 404);
      if (!isGroupAdmin(caller.role))
        return c.json({ error: 'Forbidden' }, 403);

      const target = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, targetUserId)
        ),
      });

      if (!target) return c.json({ error: 'Not found' }, 404);
      if (target.role === 'owner') return c.json({ error: 'Forbidden' }, 403);

      const { role } = c.req.valid('json');
      await db
        .update(groupMembers)
        .set({ role })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, targetUserId)
          )
        )
        .run();

      return c.json({ userId: targetUserId, role });
    }
  )
  /**
   * GET /api/groups/:groupId/invite-token
   * グループのアクティブな招待トークンを返す。なければ新規作成。
   */
  .get('/:groupId/invite-token', async (c) => {
    const groupId = c.req.param('groupId');
    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const member = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      ),
    });
    if (!member) return c.json({ error: 'Not found' }, 404);
    if (!isGroupAdmin(member.role)) return c.json({ error: 'Forbidden' }, 403);

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

    const member = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      ),
    });
    if (!member) return c.json({ error: 'Not found' }, 404);
    if (!isGroupAdmin(member.role)) return c.json({ error: 'Forbidden' }, 403);

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
