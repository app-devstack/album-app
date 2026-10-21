/** 限定公開トークンの文字数（32バイトを base64url にした長さ）。 */
export const MEDIA_SHARE_TOKEN_LENGTH = 43;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/**
 * 推測しにくい限定公開トークンを作る。
 */
export function createMediaShareToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

/**
 * パスに載せてよいトークンか判定する。
 * @param token - URL から取り出した文字列
 */
export function isMediaShareToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}
