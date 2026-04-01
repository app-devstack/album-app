import db from '@/db';
import { albums, groupInviteTokens, groupMembers } from '@/db/schema';
import { createApp } from '@/lib/api';
import { getSession } from '@/lib/service/auth';
import { and, count, eq } from 'drizzle-orm';

const router = createApp();

export const joinRouter = router
  /**
   * GET /api/join/:token
   * トークンを検証し、グループ情報を返す（公開エンドポイント）
   * - 404: トークンが存在しない
   * - 410: トークンが失効または期限切れ
   * - 200: グループ情報
   */
  .get('/:token', async (c) => {
    const token = c.req.param('token');

    const tokenRecord = await db.query.groupInviteTokens.findFirst({
      where: eq(groupInviteTokens.token, token),
      with: { group: true, inviter: true },
    });

    if (!tokenRecord) {
      return c.json({ error: 'not_found' }, 404);
    }

    const isExpired =
      tokenRecord.expiresAt !== null &&
      tokenRecord.expiresAt.getTime() < Date.now();

    if (tokenRecord.isRevoked || isExpired) {
      return c.json({ error: 'expired' }, 410);
    }

    const group = tokenRecord.group;

    // グループ内の写真数・メンバー数・アルバム数を集計
    const groupAlbums = await db.query.albums.findMany({
      where: eq(albums.groupId, group.id),
      with: {
        photos: { columns: { id: true } },
      },
    });

    const photoCount = groupAlbums.reduce((sum, a) => sum + a.photos.length, 0);
    const albumCount = groupAlbums.length;

    const memberCountResult = await db
      .select({ count: count() })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, group.id))
      .get();

    // グループのカバーは albums の coverUrl から先頭を使う（未設定なら空文字）
    const coverUrl = groupAlbums.find((a) => a.coverUrl)?.coverUrl || '';

    const inviter = tokenRecord.inviter;

    return c.json({
      groupId: group.id,
      name: group.name,
      coverUrl,
      inviter: {
        name: inviter?.name ?? 'ユーザー',
        image: inviter?.image ?? null,
      },
      createdAt: group.createdAt,
      photoCount,
      albumCount,
      memberCount: memberCountResult?.count ?? 0,
    });
  })
  /**
   * POST /api/join/:token
   * グループに参加する（認証必須）
   * - 401: 未認証
   * - 404: トークンが存在しない
   * - 410: トークンが失効または期限切れ
   * - 200: 参加済み
   * - 201: 参加成功
   */
  .post('/:token', async (c) => {
    const token = c.req.param('token');

    const session = await getSession(c.req.raw.headers);
    if (!session?.user) return c.json({ error: 'unauthorized' }, 401);

    const userId = session.user.id;

    const tokenRecord = await db.query.groupInviteTokens.findFirst({
      where: eq(groupInviteTokens.token, token),
    });

    if (!tokenRecord) {
      return c.json({ error: 'not_found' }, 404);
    }

    const isExpired =
      tokenRecord.expiresAt !== null &&
      tokenRecord.expiresAt.getTime() < Date.now();

    if (tokenRecord.isRevoked || isExpired) {
      return c.json({ error: 'expired' }, 410);
    }

    const existing = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, tokenRecord.groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (existing) {
      return c.json({ groupId: tokenRecord.groupId, alreadyMember: true }, 200);
    }

    await db
      .insert(groupMembers)
      .values({
        groupId: tokenRecord.groupId,
        userId,
        role: 'member',
        joinedAt: new Date(),
      })
      .run();

    return c.json({ groupId: tokenRecord.groupId }, 201);
  });
