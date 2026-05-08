import type { Bindings } from '@/lib/api';
import { getSession } from '@/lib/service/auth';
import { createMiddleware } from 'hono/factory';

/** セッションに紐づくユーザーが解決できなければ 404 を返し、解決できれば後続ハンドラへ進む。 */
export const requireSessionUser404 = createMiddleware<{
  Bindings: Bindings;
}>(async (c, next) => {
  const session = await getSession(c.req.raw.headers);
  if (!session?.user) {
    return c.json({ error: 'Not found' }, 404);
  }
  await next();
});
