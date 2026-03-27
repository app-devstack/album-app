import type { User } from '@/db/schema';
import { createApp } from '@/lib/api';
import { auth } from '@/lib/auth/auth';
import { authEmailSchema } from '@/lib/auth/auth-validation';
import { getMockUserByEmail, getUserByEmail } from '@/lib/service/users';
import { zValidator } from '@hono/zod-validator';

const getUser = async (email: string): Promise<User | null> => {
  const dbUser = await getUserByEmail(email);
  if (dbUser) return dbUser;

  return getMockUserByEmail(email);
};

const router = createApp();

export const authRouter = router
  .get(
    '/sign-in/email',
    zValidator('json', authEmailSchema),
    async (c, next) => {
      const { email } = c.req.valid('json');
      const user = await getUser(email);

      if (!user) {
        return c.json(
          {
            code: 'retry_login',
            message: '入力内容を確認して、もう一度お試しください。',
          },
          403
        );
      }
      await next();
    }
  )
  .get(
    '/sign-up/email',
    zValidator('json', authEmailSchema),
    async (c, next) => {
      const { email } = c.req.valid('json');
      const user = await getUser(email);

      if (!user) {
        return c.json(
          {
            code: 'retry_login',
            message: '入力内容を確認して、もう一度お試しください。',
          },
          403
        );
      }
      await next();
    }
  )
  .on(['GET', 'POST'], '/*', (c) => auth.handler(c.req.raw))
  .get('/ok', (c) => c.json({ status: 'ok' }));
