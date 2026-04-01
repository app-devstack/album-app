import { createApp } from '@/lib/api';
import { auth } from '@/lib/auth/auth';

const router = createApp();

export const authRouter = router
  .on(['GET', 'POST'], '/*', (c) => auth.handler(c.req.raw))
  .get('/ok', (c) => c.json({ status: 'ok' }));
