import { createApp } from '@/lib/api';
import { requireSessionUser404 } from '@/lib/middleware/require-session-404';
import {
  createOrGetShare,
  listVisibleShares,
  readShareForMember,
  revokeShareByPhotoId,
} from '@/lib/service/media-shares';
import { getSessionUser } from '@/lib/service/auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const photoIdSchema = z.object({
  photoId: z.string().min(1),
});

const router = createApp();

/**
 * 限定公開の発行・一覧・破棄。
 * @description 見られるアルバムのメンバーが操作できる。破棄したトークンは再利用しない。
 */
export const sharesRouter = router
  .use(requireSessionUser404)
  .get('/', async (c) => {
    const user = await getSessionUser(c);
    if (!user) return c.json({ error: 'Not found' }, 404);
    const shares = await listVisibleShares(user.id);
    return c.json({ shares });
  })
  .get(
    '/by-photo/:photoId',
    zValidator('param', photoIdSchema),
    async (c) => {
      const user = await getSessionUser(c);
      if (!user) return c.json({ error: 'Not found' }, 404);
      const { photoId } = c.req.valid('param');
      const share = await readShareForMember(user.id, photoId);
      if (!share.ok) {
        return c.json(
          { error: share.status === 403 ? 'Forbidden' : 'Not found' },
          share.status
        );
      }
      return c.json({
        share: share.token
          ? { token: share.token, createdAt: share.createdAt }
          : null,
      });
    }
  )
  .post('/', zValidator('json', photoIdSchema), async (c) => {
    const user = await getSessionUser(c);
    if (!user) return c.json({ error: 'Not found' }, 404);
    const { photoId } = c.req.valid('json');
    const created = await createOrGetShare(user.id, photoId);
    if (!created.ok) {
      return c.json(
        { error: created.status === 403 ? 'Forbidden' : 'Not found' },
        created.status
      );
    }
    return c.json({ token: created.token });
  })
  .delete(
    '/by-photo/:photoId',
    zValidator('param', photoIdSchema),
    async (c) => {
      const user = await getSessionUser(c);
      if (!user) return c.json({ error: 'Not found' }, 404);
      const { photoId } = c.req.valid('param');
      const revoked = await revokeShareByPhotoId(user.id, photoId);
      if (!revoked.ok) {
        return c.json(
          { error: revoked.status === 403 ? 'Forbidden' : 'Not found' },
          revoked.status
        );
      }
      return c.json({ ok: true });
    }
  );
