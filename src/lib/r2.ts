import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from 'cloudflare:workers';
import { v7 as uuidv7 } from 'uuid';

const R2_BUCKET_NAME = 'album-app-media';
const R2_ENDPOINT = `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  endpoint: R2_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

/**
 * Presigned URL生成の結果
 */
export interface PresignedUrlResult {
  signedUrl: string;
  key: string;
  contentType: string;
  expiresIn: number;
}

/**
 * R2アップロード処理の結果
 */
export interface UploadResult {
  success: boolean;
  key: string;
}

/**
 * R2からのオブジェクト取得結果
 */
export interface GetObjectResult {
  body: ArrayBuffer;
  contentType: string;
  cacheControl: string;
  size: number;
}

/**
 * ファイルサイズ検証の結果
 */
export interface ValidateFileSizeResult {
  valid: boolean;
  maxSize?: number;
}

/**
 * Cloudflare R2ストレージとの連携を管理するクラス
 */
class R2Manager {
  /**
   * アップロード可能なMIMEタイプの一覧
   */
  static readonly ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
  ]);

  /**
   * ファイルタイプごとの最大ファイルサイズ（バイト）
   */
  static readonly MAX_FILE_SIZE = {
    image: 10 * 1024 * 1024, // 10MB
    video: 500 * 1024 * 1024, // 500MB (長めの動画に対応するため100MBから増量)
  } as const;

  private s3Client: S3Client = s3Client;
  private bucketName: string = R2_BUCKET_NAME;

  /**
   * R2Managerインスタンスを初期化
   */
  constructor() {}

  /**
   * 許可されたMIMEタイプのSetを取得
   */
  get allowedMimeTypes() {
    return R2Manager.ALLOWED_MIME_TYPES;
  }

  /**
   * ファイルタイプごとの最大サイズ設定を取得
   */
  get maxFileSize() {
    return R2Manager.MAX_FILE_SIZE;
  }

  /**
   * R2へのアップロード用Presigned URLを生成
   * @param key - R2オブジェクトキー
   * @param contentType - ファイルのMIMEタイプ
   * @param expiresIn - URL有効期限（秒）
   * @returns Presigned URL情報
   */
  async createPresignedUrl(
    key: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<PresignedUrlResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

    return {
      signedUrl,
      key,
      contentType,
      expiresIn,
    };
  }

  /**
   * R2バケットにファイルを直接アップロード
   * @param r2Bucket - R2バケットインスタンス
   * @param key - R2オブジェクトキー
   * @param body - ファイルデータ
   * @param contentType - ファイルのMIMEタイプ
   * @param metadata - カスタムメタデータ
   * @returns アップロード結果
   */
  async upload(
    r2Bucket: R2Bucket,
    key: string,
    body: ArrayBuffer,
    contentType: string,
    metadata: Record<string, string> = {}
  ): Promise<UploadResult> {
    await r2Bucket.put(key, body, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      key,
    };
  }

  /**
   * R2バケットからオブジェクトを削除
   * @param key - 削除するR2オブジェクトキー
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * R2バケットからオブジェクトを取得
   * @param r2Bucket - R2バケットインスタンス
   * @param key - 取得するR2オブジェクトキー
   * @returns オブジェクトデータとメタデータ
   */
  async getObject(r2Bucket: R2Bucket, key: string): Promise<GetObjectResult> {
    const object = await r2Bucket.get(key);

    if (!object) {
      throw new Error('Object not found');
    }

    const body = await object.arrayBuffer();
    const contentType =
      object.httpMetadata?.contentType ?? 'application/octet-stream';
    const cacheControl =
      object.httpMetadata?.cacheControl ?? 'public, max-age=3600';

    return {
      body,
      contentType,
      cacheControl,
      size: object.size,
    };
  }

  /**
   * アルバム用のR2オブジェクトキーを生成
   * @param albumId - アルバムID
   * @param filename - 元のファイル名
   * @returns 生成されたR2オブジェクトキー
   */
  generateAlbumKey(albumId: string, filename: string): string {
    const timestamp = Date.now();
    const uniqueId = uuidv7();
    return `albums/${albumId}/${timestamp}-${uniqueId}-${filename}`;
  }

  /**
   * プロフィール画像用のR2オブジェクトキーを生成
   * @param filename - 元のファイル名
   * @returns 生成されたR2オブジェクトキー
   */
  generateProfileKey(filename: string): string {
    const timestamp = Date.now();
    const uniqueId = uuidv7();
    return `profiles/${timestamp}-${uniqueId}-${filename}`;
  }

  /**
   * ファイルのMIMEタイプが許可されているか検証
   * @param contentType - 検証するMIMEタイプ
   * @returns 許可されている場合true
   */
  validateFileType(contentType: string): boolean {
    return R2Manager.ALLOWED_MIME_TYPES.has(contentType);
  }

  /**
   * ファイルサイズが制限内か検証
   * @param fileSize - ファイルサイズ（バイト）
   * @param contentType - ファイルのMIMEタイプ
   * @returns 検証結果
   */
  validateFileSize(
    fileSize: number,
    contentType: string
  ): ValidateFileSizeResult {
    const fileType = contentType.startsWith('image/') ? 'image' : 'video';
    const maxSize = R2Manager.MAX_FILE_SIZE[fileType];

    if (fileSize > maxSize) {
      return { valid: false, maxSize };
    }

    return { valid: true };
  }
}

/**
 * R2Managerのシングルトンインスタンス
 */
export const r2Manager = new R2Manager();
export default r2Manager;
