import db from '@/db';
import { photos } from '@/db/schema';
import { createApp } from '@/lib/api';
import {
  buildAlbumUploadBufferUrl,
  decodeKeyFromLocalObjectPathname,
  deleteStoredObject,
  enableLocalUploading,
  isServeableObjectKey,
  r2Manager,
  resolveObjectPublicUrl,
} from '@/lib/media-storage';
import { getAcceptFormat } from '@/lib/photo/utils';
import { zValidator } from '@hono/zod-validator';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod Schemas
const uploadUrlSchema = z.object({
  filename: z.string().min(1, 'ファイル名は必須です'),
  contentType: z.string().min(1, 'Content-Typeは必須です'),
  fileSize: z.number().positive('ファイルサイズは必須です'),
});

const createPhotoSchema = z.object({
  thumbnailUrl: z.string().url().nullable().optional(),
  alt: z.string().default(''),
  caption: z.string().nullable().optional(),
  mediaType: z.enum(['image', 'video']).default('image'),
  duration: z.number().nullable().optional(),
  r2Key: z.string(),
});

export type UploadUrlRequest = z.infer<typeof uploadUrlSchema>;
export type CreatePhotoRequest = z.infer<typeof createPhotoSchema>;

function assertAlbumObjectKey(albumId: string, key: string): boolean {
  const prefix = `albums/${albumId}/`;
  return key.startsWith(prefix);
}

// Photos Router
const router = createApp();

export const photosRouter = router
  .get('/local-object/*', async (c) => {
    const pathname = new URL(c.req.url).pathname;
    const key = decodeKeyFromLocalObjectPathname(pathname);
    if (!key || !isServeableObjectKey(key)) {
      return c.json({ error: 'Not found' }, 404);
    }
    try {
      const obj = await r2Manager.getObject(env.R2, key);
      return new Response(obj.body, {
        headers: {
          'Content-Type': obj.contentType,
          'Cache-Control': obj.cacheControl || 'public, max-age=3600',
        },
      });
    } catch {
      return c.json({ error: 'Not found' }, 404);
    }
  })
  .get('/:photoId/optimized', async (c) => {
    const photoId = c.req.param('photoId');
    const mode = c.req.query('mode') || 'thumb'; // 'thumb' or 'full'

    const photoData = await db.query.photos.findFirst({
      where: eq(photos.id, photoId),
    });

    if (!photoData || !photoData.url) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    const isThumb = mode === 'thumb';

    const accept = c.req.header('Accept') ?? '';
    const format = getAcceptFormat(accept);

    const imageOptions = {
      width: isThumb ? 400 : 1920,
      height: isThumb ? 400 : undefined,
      fit: isThumb ? 'cover' : 'scale-down',
      quality: isThumb ? 75 : 85,
      format, // 'avif' | 'webp' | 'jpeg' | 'png' | 'svg' | undefined
    } satisfies RequestInitCfPropertiesImage;

    const sourceUrl = photoData.thumbnailUrl || photoData.url;

    try {
      // Cloudflare Image Resizing を適用して fetch
      const response = await fetch(sourceUrl, {
        cf: {
          image: imageOptions,
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch source image: ${response.status}`);
        return c.text('Failed to process image', 500);
      }

      // レスポンスの返却（キャッシュヘッダーを付与）
      const res = new Response(response.body, response);
      res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.headers.set(
        'Content-Type',
        response.headers.get('Content-Type') || 'image/webp'
      );

      return res;
    } catch (error) {
      console.error('Image optimization error:', error);
      return c.text('Internal Server Error', 500);
    }
  })
  .get('/album/:albumId', async (c) => {
    const albumId = c.req.param('albumId');
    const albumPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.albumId, albumId))
      .all();
    return c.json(albumPhotos);
  })
  .post(
    '/album/:albumId/upload-url',
    zValidator('json', uploadUrlSchema),
    async (c) => {
      try {
        const albumId = c.req.param('albumId');
        const { filename, contentType, fileSize } = c.req.valid('json');

        // ファイルタイプの検証
        if (!r2Manager.validateFileType(contentType)) {
          return c.json(
            {
              error: 'ファイルタイプが許可されていません',
              allowedTypes: Array.from(r2Manager.allowedMimeTypes),
            },
            400
          );
        }

        // ファイルサイズの検証
        const sizeValidation = r2Manager.validateFileSize(
          fileSize,
          contentType
        );
        if (!sizeValidation.valid) {
          return c.json(
            {
              error: `ファイルサイズが大きすぎます。最大サイズ: ${sizeValidation.maxSize! / 1024 / 1024}MB`,
              maxSize: sizeValidation.maxSize,
            },
            400
          );
        }

        // 一意なキーを生成
        const key = r2Manager.generateAlbumKey(albumId, filename);

        if (enableLocalUploading(env)) {
          const signedUrl = buildAlbumUploadBufferUrl(c.req.url, albumId, key);
          const expiresIn = 3600;
          return c.json({
            signedUrl,
            key,
            contentType,
            expiresIn,
            message: 'Presigned URLを生成しました(Local Upload)',
          });
        }

        const result = await r2Manager.createPresignedUrl(key, contentType);

        return c.json({
          ...result,
          message: 'Presigned URLを生成しました',
        });
      } catch (error) {
        console.error('Presigned URL generation error:', error);
        return c.json(
          {
            error: 'Presigned URL生成に失敗しました',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          500
        );
      }
    }
  )
  .put('/album/:albumId/upload-buffer', async (c) => {
    try {
      const albumId = c.req.param('albumId');
      const key = c.req.query('key')?.trim();
      if (!key) {
        return c.json({ error: 'key クエリが必要です' }, 400);
      }

      if (!assertAlbumObjectKey(albumId, key)) {
        return c.json({ error: '無効なオブジェクトキーです' }, 400);
      }

      const contentType =
        c.req.header('Content-Type') || 'application/octet-stream';

      if (!r2Manager.validateFileType(contentType)) {
        return c.json(
          {
            error: 'ファイルタイプが許可されていません',
            allowedTypes: Array.from(r2Manager.allowedMimeTypes),
          },
          400
        );
      }

      const body = await c.req.arrayBuffer();

      const sizeValidation = r2Manager.validateFileSize(
        body.byteLength,
        contentType
      );
      if (!sizeValidation.valid) {
        return c.json(
          {
            error: `ファイルサイズが大きすぎます。最大サイズ: ${sizeValidation.maxSize! / 1024 / 1024}MB`,
          },
          400
        );
      }

      const objectTail = key.slice(`albums/${albumId}/`.length);

      const r2 = env.R2;
      await r2Manager.upload(r2, key, body, contentType, {
        albumId,
        originalFilename: objectTail || 'file',
      });

      return c.text('', 200);
    } catch (error) {
      console.error('Upload buffer error:', error);
      return c.json(
        {
          error: 'アップロードに失敗しました',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  })
  .post('/album/:albumId', zValidator('json', createPhotoSchema), async (c) => {
    const albumId = c.req.param('albumId');
    const body = c.req.valid('json');

    const url = resolveObjectPublicUrl(body.r2Key, env);

    const newPhoto = {
      id: uuidv7(),
      url,
      albumId,
      thumbnailUrl: body.thumbnailUrl ?? null,
      alt: body.alt,
      caption: body.caption ?? null,
      mediaType: body.mediaType,
      duration: body.duration ?? null,
      r2Key: body.r2Key,
      addedAt: new Date().toISOString(),
    };
    await db.insert(photos).values(newPhoto).run();
    return c.json(newPhoto, 201);
  })
  .delete('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const photo = await db
        .select()
        .from(photos)
        .where(eq(photos.id, id))
        .get();

      if (!photo) {
        return c.json({ error: '写真が見つかりません' }, 404);
      }

      // R2からファイルを削除
      if (photo.r2Key) {
        try {
          await deleteStoredObject(env.R2, photo.r2Key, env);
        } catch (error) {
          console.error('R2 delete error:', error);
          // R2削除エラーはログに記録するが、DB削除は続行
        }
      }

      // DBから削除
      await db.delete(photos).where(eq(photos.id, id)).run();
      return c.json({ message: '写真を削除しました' }, 200);
    } catch (error) {
      console.error('Photo deletion error:', error);
      return c.json(
        {
          error: '写真の削除に失敗しました',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  });
