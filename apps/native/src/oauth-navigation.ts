/** http(s) / about / data 以外のナビ（album:// や intent://）か。 */
export function isNonHttpNavigation(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('about:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return false;
  }
  return true;
}

/** WebView がカスタムスキームを読めずに出したエラーか。 */
export function isUnknownSchemeError(event: {
  code?: number;
  description?: string;
}): boolean {
  const description = event.description ?? '';
  return (
    event.code === -10 ||
    description.includes('ERR_UNKNOWN_URL_SCHEME') ||
    description.includes('scheme that is not HTTP')
  );
}
