import Constants from 'expo-constants';

function originFromWebAppUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.replace(/\/albums$/i, '');
}

const extraUrl =
  (Constants.expoConfig?.extra?.webAppUrl as string | undefined) ??
  'https://album-app.maru-maru.workers.dev';

/** Web / API のオリジン（末尾スラッシュなし）。 */
export const WEB_APP_URL: string = originFromWebAppUrl(extraUrl);

/** WebView の初期表示 URL。 */
export const WEB_APP_START_URL: string = `${WEB_APP_URL}/albums`;
