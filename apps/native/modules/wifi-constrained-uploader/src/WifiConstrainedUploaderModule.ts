import { NativeModule, requireNativeModule } from 'expo';

/** OS ネイティブ PUT 開始オプション。 */
export type StartUploadOptions = {
  filePath: string;
  url: string;
  headers: Record<string, string>;
  method: 'PUT';
  network: 'any' | 'wifi-only';
};

/** アップロード完了 / 失敗イベントのペイロード。 */
export type UploadEventPayload = {
  id: string;
  error?: string;
};

declare class WifiConstrainedUploaderNativeModule extends NativeModule<{
  completed: (event: UploadEventPayload) => void;
  failed: (event: UploadEventPayload) => void;
}> {
  startUpload(options: StartUploadOptions): Promise<{ id: string }>;
  reattach(): Promise<void>;
  cancelUpload(id: string): Promise<void>;
  getActiveUploadIds(): Promise<string[]>;
}

export default requireNativeModule<WifiConstrainedUploaderNativeModule>(
  'WifiConstrainedUploader'
);
