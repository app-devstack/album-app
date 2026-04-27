import { getAcceptFormat } from '@/lib/photo/utils';

export type OptimizedImageMode = 'thumb' | 'full';

/**
 * Cloudflare Image Resizing（cf.image）でソース URL から最適化済み画像レスポンスを取得する
 */
export async function fetchOptimizedImageResponse(
  sourceUrl: string,
  mode: OptimizedImageMode,
  acceptHeader: string
): Promise<Response> {
  const isThumb = mode === 'thumb';
  const format = getAcceptFormat(acceptHeader);
  const imageOptions = {
    width: isThumb ? 400 : 1920,
    height: isThumb ? 400 : undefined,
    fit: isThumb ? 'cover' : 'scale-down',
    quality: isThumb ? 75 : 85,
    format,
  } satisfies RequestInitCfPropertiesImage;

  try {
    const response = await fetch(sourceUrl, {
      cf: {
        image: imageOptions,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch source image: ${response.status}`);
      return new Response('Failed to process image', { status: 500 });
    }

    const res = new Response(response.body, response);
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.headers.set(
      'Content-Type',
      response.headers.get('Content-Type') || 'image/webp'
    );
    return res;
  } catch (error) {
    console.error('Image optimization error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
