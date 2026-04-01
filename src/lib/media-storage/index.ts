import type { Bindings } from '@/lib/api';
import { r2Manager } from '@/lib/r2';

/** メディア保存まわりで参照する env の部分型 */
type MediaEnv = Pick<
  Bindings,
  | 'ENABLE_LOCAL_UPLOAD'
  | 'R2_ACCESS_KEY_ID'
  | 'R2_SECRET_ACCESS_KEY'
  | 'R2_ENDPOINT'
>;

const LOCAL_OBJECT_PATH = '/api/photos/local-object/';

/**
 * ローカルアップロードを有効にするか判定
 *
 * @description
 * Presigned 直 PUT ではなく upload-buffer（R2 バインディング）を使うか。
 */
export function enableLocalUploading(env: MediaEnv): boolean {
  return env.ENABLE_LOCAL_UPLOAD === 'true';
}

/**
 * リクエストパスからオブジェクトキーを復元
 */
export function decodeKeyFromLocalObjectPathname(
  pathname: string
): string | null {
  const i = pathname.indexOf(LOCAL_OBJECT_PATH);
  if (i === -1) return null;
  const rest = pathname.slice(i + LOCAL_OBJECT_PATH.length);
  if (!rest || rest.includes('..')) return null;
  try {
    return rest
      .split('/')
      .filter((s) => s.length > 0)
      .map((s) => decodeURIComponent(s))
      .join('/');
  } catch {
    return null;
  }
}

/**
 * GET プロキシで配信してよいキーか（オープンプロキシ防止の最低限）
 */
export function isServeableObjectKey(key: string): boolean {
  if (!key || key.includes('..')) return false;
  return key.startsWith('albums/') || key.startsWith('profiles/');
}

/**
 * 保存オブジェクトの公開 URL（本番は R2 公開オリジン、ローカルは同一オリジンのプロキシ）
 */
export function resolveObjectPublicUrl(
  objectKey: string,
  env: MediaEnv
): string {
  const base = String(env.R2_ENDPOINT ?? '').replace(/\/$/, '');
  return `${base}/${objectKey}`;
}

/**
 * アルバム用 upload-buffer への絶対 URL
 */
export function buildAlbumUploadBufferUrl(
  requestUrl: string,
  albumId: string,
  key: string
): string {
  const u = new URL(requestUrl);
  u.pathname = `/api/photos/album/${encodeURIComponent(albumId)}/upload-buffer`;
  u.search = '';
  u.hash = '';
  u.searchParams.set('key', key);
  return u.toString();
}

/**
 * プロフィール用 upload-buffer への絶対 URL
 */
export function buildProfileUploadBufferUrl(
  requestUrl: string,
  key: string
): string {
  const u = new URL(requestUrl);
  u.pathname = '/api/profile/upload-avatar-buffer';
  u.search = '';
  u.hash = '';
  u.searchParams.set('key', key);
  return u.toString();
}

/**
 * オブジェクト削除（本番: S3 API、ローカル/バインディング優先: R2.delete）
 */
export async function deleteStoredObject(
  r2: R2Bucket,
  key: string,
  env: MediaEnv
): Promise<void> {
  if (enableLocalUploading(env)) {
    await r2.delete(key);
    return;
  }
  await r2Manager.delete(key);
}

export { r2Manager };
