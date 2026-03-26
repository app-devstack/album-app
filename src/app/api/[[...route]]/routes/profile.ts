import { createApp } from '@/lib/api';
import { r2Manager } from '@/lib/r2';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Zod Schemas
const uploadAvatarSchema = z.object({
  filename: z.string().min(1, 'ファイル名は必須です'),
  contentType: z
    .string()
    .refine(
      (type) =>
        type === 'image/jpeg' || type === 'image/png' || type === 'image/webp',
      'jpeg、png、webpのみ許可されています'
    ),
  fileSize: z
    .number()
    .max(5 * 1024 * 1024, 'ファイルサイズは5MB以内にしてください'),
});

// Profile Router
const router = createApp();

export const profileRouter = router
  .post('/upload-avatar', zValidator('json', uploadAvatarSchema), async (c) => {
    try {
      const { filename, contentType } = c.req.valid('json');

      // ユニークなキーを生成
      const key = r2Manager.generateProfileKey(filename);

      // Presigned URLを生成
      const result = await r2Manager.createPresignedUrl(key, contentType);

      return c.json({
        ...result,
        message: 'Presigned URLを生成しました',
      });
    } catch (error) {
      console.error('Avatar presigned URL generation error:', error);
      return c.json(
        {
          error: 'アバターアップロードURL生成に失敗しました',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  })
  .put('/upload-avatar-direct', async (c) => {
    try {
      const contentType = c.req.header('Content-Type') || 'image/jpeg';
      const body = await c.req.arrayBuffer();

      // ファイルサイズの検証
      if (body.byteLength > 5 * 1024 * 1024) {
        return c.json({ error: 'ファイルサイズは5MB以内にしてください' }, 400);
      }

      const filename = c.req.header('X-Filename') || 'avatar.jpg';
      const key = r2Manager.generateProfileKey(filename);

      // R2にアップロード
      const result = await r2Manager.upload(c.env.R2, key, body, contentType, {
        originalFilename: filename,
      });

      return c.json({
        ...result,
        message: 'アバターをアップロードしました',
      });
    } catch (error) {
      console.error('Avatar direct upload error:', error);
      return c.json(
        {
          error: 'アップロードに失敗しました',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  });
