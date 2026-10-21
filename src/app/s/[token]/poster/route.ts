import {
  ownThumbnailObjectKey,
  sharedObjectResponse,
} from '@/lib/media-share-object';
import { findActiveShareByToken } from '@/lib/service/media-shares';

type SharePosterContext = {
  params: Promise<{ token: string }>;
};

/** 限定公開の動画サムネイル。自前バケットのキーだけを返す。 */
export async function GET(_request: Request, context: SharePosterContext) {
  const { token } = await context.params;
  const share = await findActiveShareByToken(token);
  const thumbnailUrl = share?.photo.thumbnailUrl;
  const key =
    share?.photo.mediaType === 'video' && thumbnailUrl
      ? ownThumbnailObjectKey(thumbnailUrl)
      : null;
  if (!key) {
    return new Response('見つかりません', {
      status: 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  return sharedObjectResponse(key, null);
}
