import { sharedObjectResponse } from '@/lib/media-share-object';
import { findActiveShareByToken } from '@/lib/service/media-shares';

type ShareMediaContext = {
  params: Promise<{ token: string }>;
};

/** 限定公開中の本体。トークンが無効なら 404。 */
export async function GET(request: Request, context: ShareMediaContext) {
  const { token } = await context.params;
  const share = await findActiveShareByToken(token);
  if (!share?.photo.r2Key) {
    return new Response('見つかりません', {
      status: 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  return sharedObjectResponse(
    share.photo.r2Key,
    request.headers.get('Range')
  );
}
