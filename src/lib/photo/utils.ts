type AcceptFormat = RequestInitCfPropertiesImage['format'];

const FORMAT_MAP = {
  'image/avif': 'avif',
  'image/webp': 'webp',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/jpeg': 'jpeg',
} as const satisfies Record<string, AcceptFormat>;

/**
 * Acceptヘッダーの値から、Cloudflare Image Resizingでサポートされているフォーマットを判別して返す
 */
export function getAcceptFormat(accept: string): AcceptFormat {
  for (const [mimeType, format] of Object.entries(FORMAT_MAP)) {
    if (accept.includes(mimeType)) return format;
  }
  return undefined;
}

/**
 * photoIdを引数に、APIリクエストのURLを生成する
 */
export function getOptimizedPhotoUrl(
  photoId: string,
  mode: 'thumb' | 'full' = 'thumb'
) {
  return `/api/photos/${photoId}/optimized?mode=${mode}`;
}
