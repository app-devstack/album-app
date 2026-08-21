import WifiConstrainedUploaderModule from './src/WifiConstrainedUploaderModule';
import type {
  StartUploadOptions,
  UploadEventPayload,
} from './src/WifiConstrainedUploaderModule';
import type { EventSubscription } from 'expo-modules-core';

export type { StartUploadOptions, UploadEventPayload };

/** OS ネイティブの Wi-Fi 制約付きバックグラウンド PUT を開始する。 */
export function startUpload(
  options: StartUploadOptions
): Promise<{ id: string }> {
  return WifiConstrainedUploaderModule.startUpload(options);
}

/** アップロード完了 / 失敗イベントを購読する。 */
export function addListener(
  event: 'completed' | 'failed',
  cb: (e: UploadEventPayload) => void
): EventSubscription {
  return WifiConstrainedUploaderModule.addListener(event, cb);
}

/** アプリ起動時に background セッション / WorkManager を再アタッチする。 */
export function reattach(): Promise<void> {
  return WifiConstrainedUploaderModule.reattach();
}

/** OS ネイティブの待機中 PUT を取り消す。 */
export function cancelUpload(id: string): Promise<void> {
  return WifiConstrainedUploaderModule.cancelUpload(id);
}

/** 実行中または待機中のネイティブ PUT の uploadId 一覧を返す。 */
export function getActiveUploadIds(): Promise<string[]> {
  return WifiConstrainedUploaderModule.getActiveUploadIds();
}

export default {
  startUpload,
  addListener,
  reattach,
  cancelUpload,
  getActiveUploadIds,
};
