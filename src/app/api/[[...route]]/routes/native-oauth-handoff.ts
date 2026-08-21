import { createApp } from '@/lib/api';
import { splitSetCookieHeader } from 'better-auth/cookies';

/** Native OAuth 完了後、クエリの Set-Cookie を WebView に載せてアルバムへ戻す。 */
export const nativeOAuthHandoffRouter = createApp().get('/', (c) => {
  const cookie = c.req.query('cookie');
  if (!cookie || /[\r\n]/.test(cookie)) {
    return c.redirect('/login', 302);
  }

  for (const part of splitSetCookieHeader(cookie)) {
    const trimmed = part.trim();
    if (trimmed.length === 0) {
      continue;
    }
    c.header('Set-Cookie', trimmed, { append: true });
  }

  return c.redirect('/albums', 302);
});
