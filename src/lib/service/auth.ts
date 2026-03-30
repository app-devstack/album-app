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
