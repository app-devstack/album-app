import db from '@/db';
import { photos } from '@/db/schema';
import { createApp } from '@/lib/api';
import { requireSessionUser404 } from '@/lib/middleware/require-session-404';
import { fetchOptimizedImageResponse } from '@/lib/photo/fetch-optimized-image';
import { r2Manager } from '@/lib/r2';
import { canUserAccessAlbum } from '@/lib/service/albums';
import { getSessionUser } from '@/lib/service/auth';
import { zValidator } from '@hono/zod-validator';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const downloadPhotoQuerySchema = z.object({
  size: z.enum(['full', 'optimized']),
});

/**
 * RFC 5987 を避け、ファイル名として安全な ASCII のみから構成するダウンロード用ファイル名を返す。
 */
function safeDownloadBasename(photoId: string): string {
  return photoId.replace(/[^\w.-]+/g, '_') || 'photo';
}

/** Content-Type から代表的な拡張子を推測する。 */
function extensionFromContentType(contentType: string): string {
  const ct = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (ct.includes('jpeg')) return '.jpg';
  if (ct.includes('png')) return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('heic')) return '.heic';
  if (ct.includes('heif')) return '.heif';
  return '.bin';
}

/**
 * Content-Disposition: attachment 用ヘッダー値を組み立てる。
 *
 * @param filename - アスキーのみで構成されるファイル名（改行などを含まない）
 */
function contentDispositionAttachment(filename: string): string {
  const escaped = filename.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `attachment; filename="${escaped}"`;
}

const router = createApp();

/**
 * GET `/download/photo/:photoId?size=` — アルバム権限がある場合のみ写真をダウンロード用レスポンスで返す。
 */
export const downloadRouter = router
  .use(requireSessionUser404)
  .get(
    '/photo/:photoId',
    zValidator('query', downloadPhotoQuerySchema),
    async (c) => {
      const user = await getSessionUser(c);
      if (!user) {
        return c.json({ error: 'Not found' }, 404);
      }

      const photoId = c.req.param('photoId');
      const { size } = c.req.valid('query');

      const photoRow = await db.query.photos.findFirst({
        where: eq(photos.id, photoId),
        with: { album: true },
      });

      if (!photoRow?.album) {
        return c.json({ error: 'Not found' }, 404);
      }

      if (photoRow.mediaType !== 'image') {
        return c.json({ error: 'Not found' }, 404);
      }

      if (!(await canUserAccessAlbum(user.id, photoRow.album))) {
        return c.json({ error: 'Forbidden' }, 403);
      }

      const basename = safeDownloadBasename(photoRow.id);

      if (size === 'full') {
        if (!photoRow.r2Key) {
          return c.json({ error: 'Not found' }, 404);
        }

        try {
          const obj = await r2Manager.getObject(env.R2, photoRow.r2Key);
          const filename = `${basename}${extensionFromContentType(obj.contentType)}`;
          return new Response(obj.body, {
            status: 200,
            headers: {
              'Content-Type': obj.contentType,
              'Cache-Control': obj.cacheControl,
              'Content-Disposition': contentDispositionAttachment(filename),
            },
          });
        } catch {
          return c.json({ error: 'Not found' }, 404);
        }
      }

      const sourceUrl = photoRow.thumbnailUrl || photoRow.url;
      const accept = c.req.header('Accept') ?? '';
      const res = await fetchOptimizedImageResponse(sourceUrl, 'full', accept);

      if (!res.ok) {
        return res;
      }

      const outType = res.headers.get('Content-Type') || 'image/webp';
      const filename = `${basename}${extensionFromContentType(outType)}`;
      const headers = new Headers(res.headers);
      headers.set(
        'Content-Disposition',
        contentDispositionAttachment(filename)
      );

      return new Response(res.body, {
        status: res.status,
        headers,
      });
    }
  );
