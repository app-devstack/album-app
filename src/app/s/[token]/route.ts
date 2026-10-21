import { renderSharePage } from '@/lib/media-share-page';
import { ownThumbnailObjectKey } from '@/lib/media-share-object';
import { findActiveShareByToken } from '@/lib/service/media-shares';

type ShareRouteContext = {
  params: Promise<{ token: string }>;
};

/** 限定公開の1件ページ。ログイン不要。 */
export async function GET(request: Request, context: ShareRouteContext) {
  const { token } = await context.params;
  const share = await findActiveShareByToken(token);
  if (!share) {
    return new Response('見つかりません', {
      status: 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  const origin = new URL(request.url).origin;
  const hasPoster =
    share.photo.mediaType === 'video' &&
    !!share.photo.thumbnailUrl &&
    ownThumbnailObjectKey(share.photo.thumbnailUrl) !== null;

  const html = renderSharePage({
    token,
    mediaType: share.photo.mediaType,
    origin,
    hasPoster,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}
