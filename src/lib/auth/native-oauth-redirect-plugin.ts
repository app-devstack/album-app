import { createAuthMiddleware } from 'better-auth/api';

/**
 * OAuth 完了後、カスタムスキームへリダイレクトするときに Set-Cookie を URL へ載せる。
 * @description iOS の ASWebAuthenticationSession は https コールバックを受け取れないため、
 * `album://` に戻したうえで WebView へ cookie を引き渡す。
 */
export function nativeOAuthRedirectPlugin() {
  return {
    id: 'native-oauth-redirect',
    hooks: {
      after: [
        {
          matcher(context: { path?: string }) {
            return !!context.path?.startsWith('/callback');
          },
          handler: createAuthMiddleware(async (ctx) => {
            const headers = ctx.context.responseHeaders;
            const location = headers?.get('location');
            if (!location) {
              return;
            }

            let redirectURL: URL;
            try {
              redirectURL = new URL(location);
            } catch {
              return;
            }

            if (
              redirectURL.protocol === 'http:' ||
              redirectURL.protocol === 'https:'
            ) {
              return;
            }

            if (redirectURL.protocol !== 'album:') {
              return;
            }

            const cookie = headers?.get('set-cookie');
            if (!cookie) {
              return;
            }

            redirectURL.searchParams.set('cookie', cookie);
            ctx.setHeader('location', redirectURL.toString());
          }),
        },
      ],
    },
  };
}
