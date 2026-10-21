import { env } from 'cloudflare:workers';

/** 範囲付きで返す R2 オブジェクトの応答。トークン確認は呼び出し側で行う。 */
export async function sharedObjectResponse(
  key: string,
  rangeHeader: string | null
): Promise<Response> {
  const head = await env.R2.head(key);
  if (!head) {
    return new Response('見つかりません', {
      status: 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  const contentType =
    head.httpMetadata?.contentType ?? 'application/octet-stream';
  const size = head.size;
  const range = parseByteRange(rangeHeader, size);

  if (rangeHeader && !range) {
    return new Response(null, {
      status: 416,
      headers: {
        'Content-Range': `bytes */${size}`,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const object = await env.R2.get(
    key,
    range ? { range: { offset: range.offset, length: range.length } } : undefined
  );
  if (!object) {
    return new Response('見つかりません', {
      status: 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  const headers = new Headers({
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
  });

  if (range) {
    const end = range.offset + range.length - 1;
    headers.set('Content-Length', String(range.length));
    headers.set('Content-Range', `bytes ${range.offset}-${end}/${size}`);
    return new Response(object.body, { status: 206, headers });
  }

  headers.set('Content-Length', String(size));
  return new Response(object.body, { status: 200, headers });
}

/**
 * 保存されたサムネイルURLから、この環境のオブジェクトキーを取り出す。
 * @param thumbnailUrl - 写真行に保存された公開URL
 */
export function ownThumbnailObjectKey(thumbnailUrl: string): string | null {
  const base = String(env.R2_ENDPOINT ?? '').replace(/\/$/, '');
  if (!base || !thumbnailUrl.startsWith(`${base}/`)) return null;
  let key = thumbnailUrl.slice(base.length + 1);
  try {
    key = decodeURIComponent(key);
  } catch {
    return null;
  }
  if (!key.startsWith('albums/') || key.includes('..')) return null;
  return key;
}

function parseByteRange(
  header: string | null,
  size: number
): { offset: number; length: number } | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.split(',')[0]?.trim() ?? '');
  if (!match || size <= 0) return null;
  const startRaw = match[1] ?? '';
  const endRaw = match[2] ?? '';

  if (startRaw === '') {
    const suffix = Number(endRaw);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    const length = Math.min(size, suffix);
    return { offset: size - length, length };
  }

  const offset = Number(startRaw);
  if (!Number.isFinite(offset) || offset < 0 || offset >= size) return null;
  const end = endRaw === '' ? size - 1 : Number(endRaw);
  if (!Number.isFinite(end) || end < offset) return null;
  const last = Math.min(end, size - 1);
  return { offset, length: last - offset + 1 };
}
