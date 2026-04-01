// クライアント用定数（cloudflare:workers をインポートできないため分離）

/**
 * アプリのベースURL
 * NEXT_PUBLIC_APP_URL環境変数または window.location.origin を使用
 */
const getAppUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

export const APP_URL = getAppUrl();
