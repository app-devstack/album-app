import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'album.sessionToken';

/** SecureStore から Bearer セッショントークンを取得する。 */
export async function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

/** SecureStore に Bearer セッショントークンを保存する。 */
export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

/** SecureStore から Bearer セッショントークンを削除する。 */
export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}
