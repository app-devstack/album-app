import { Hono } from 'hono';
import { hc } from 'hono/client';
import type { AppType } from '../app/api/[[...route]]/route';

/**
 * Cloudflare Workers Bindings型定義
 *
 * 全てのHonoルーターで共通利用する環境変数の型定義。
 * - D1 Database
 * - R2 Bucket
 * - 各種Cloudflareクレデンシャル
 */
export type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  MEDIA: MediaBinding;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_ENDPOINT: string;
  ENABLE_LOCAL_UPLOAD?: string | undefined;
};

/**
 * Hono インスタンスの生成
 */
export const createApp = () => new Hono<{ Bindings: Bindings }>();

/**
 * APIクライアントの生成
 */
const client = hc<AppType>('/', {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: 'include', // クッキーを含める
    }),
});

/**
 * APIクライアント
 */
export const api = client.api;
