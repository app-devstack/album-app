import type { Session } from '@/lib/auth/auth';
import { auth } from '@/lib/auth/auth';

/**
 * ヘッダーからセッションデータを取得する
 */
export async function getSession(headers: Headers) {
  try {
    return await auth.api.getSession({ headers });
  } catch {
    return null;
  }
}

/** `getSessionUser` が受け取る Hono コンテキストの最小形状。 */
type SessionUserContext = { req: { raw: Request } };

/**
 * Hono コンテキストからセッションに紐づくユーザーを返す。未ログインや解決できない場合は undefined。
 */
export async function getSessionUser(
  c: SessionUserContext
): Promise<Session['user'] | undefined> {
  const session = await getSession(c.req.raw.headers);
  return session?.user;
}
