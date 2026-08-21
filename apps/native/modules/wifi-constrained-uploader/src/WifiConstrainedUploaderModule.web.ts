import { registerWebModule, NativeModule } from 'expo';

import type {
  StartUploadOptions,
  UploadEventPayload,
} from './WifiConstrainedUploaderModule';

class WifiConstrainedUploaderModule extends NativeModule<{
  completed: (event: UploadEventPayload) => void;
  failed: (event: UploadEventPayload) => void;
}> {
  async startUpload(options: StartUploadOptions): Promise<{ id: string }> {
    return { id: `web-${Date.now()}` };
  }

  async reattach(): Promise<void> {}

  async cancelUpload(_id: string): Promise<void> {}

  async getActiveUploadIds(): Promise<string[]> {
    return [];
  }
}

export default registerWebModule(
  WifiConstrainedUploaderModule,
  'WifiConstrainedUploader'
);
