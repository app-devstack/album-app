declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

/** Wi-Fi 待ちなど Native 側で保留中のアップロード項目。 */
export type NativePendingUploadItem = {
  id: string;
  mediaType: 'image' | 'video';
  previewDataUrl: string;
  status: 'pending' | 'failed';
};

/** Native シェルへ送るメッセージ。 */
export type NativeOutgoingMessage =
  | { type: 'OPEN_PICKER'; albumId: string; mediaType: 'image' | 'video' }
  | { type: 'SESSION_TOKEN'; token: string }
  | { type: 'GET_PENDING_UPLOADS'; albumId: string }
  | { type: 'RETRY_PENDING_UPLOAD'; id: string }
  | { type: 'CANCEL_PENDING_UPLOAD'; id: string }
  | { type: 'GET_NETWORK_STATE' };

/** React Native WebView 内か。 */
export const isNative = () =>
  typeof window !== 'undefined' && !!window.ReactNativeWebView;

/** Native へ JSON メッセージを送る。非 Native では何もしない。 */
export function sendToNative(msg: NativeOutgoingMessage) {
  if (typeof window === 'undefined') return;
  window.ReactNativeWebView?.postMessage(JSON.stringify(msg));
}
