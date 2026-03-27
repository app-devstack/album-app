import { env } from 'cloudflare:workers';

/**
 * R2のエンドポイント
 */
export const R2_CUSTOM_ENDPOINT = env.R2_ENDPOINT;
