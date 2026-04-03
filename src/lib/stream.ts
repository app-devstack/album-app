import { env } from 'cloudflare:workers';

/**
 * Cloudflare Stream APIのレスポンス型
 */
export interface StreamVideo {
  uid: string;
  thumbnail: string;
  thumbnailTimestampPct: number;
  readyToStream: boolean;
  status: {
    state: 'queued' | 'inprogress' | 'ready' | 'error';
    pctComplete: string;
    errorReasonCode?: string;
    errorReasonText?: string;
  };
  meta: Record<string, string>;
  created: string;
  modified: string;
  size: number;
  preview: string;
  allowedOrigins: string[];
  requireSignedURLs: boolean;
  uploaded: string;
  uploadExpiry: string | null;
  maxSizeBytes: number;
  maxDurationSeconds: number;
  duration: number;
  input: {
    width: number;
    height: number;
  };
  playback: {
    hls: string;
    dash: string;
  };
  watermark?: {
    uid: string;
  };
}

/**
 * Stream Upload via Link APIのレスポンス型
 */
export interface StreamUploadViaLinkResponse {
  result: StreamVideo;
  success: boolean;
  errors: Array<{ message: string }>;
  messages: string[];
}

/**
 * Cloudflare Stream APIクライアント
 */
class StreamManager {
  private accountId: string;
  private apiToken: string;

  constructor() {
    this.accountId = env.CLOUDFLARE_ACCOUNT_ID;
    this.apiToken = env.CLOUDFLARE_STREAM_API_TOKEN;
  }

  /**
   * Stream API のベースURL
   */
  private get baseUrl(): string {
    return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
  }

  /**
   * R2のPresigned GET URLからStreamへ動画を取り込む（Upload via Link）
   * @param r2PresignedUrl - R2の署名付きGET URL
   * @param metadata - 動画のメタデータ（オプション）
   * @returns Stream動画情報
   */
  async copyFromR2(
    r2PresignedUrl: string,
    metadata?: Record<string, string>
  ): Promise<StreamVideo> {
    const response = await fetch(`${this.baseUrl}/copy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: r2PresignedUrl,
        meta: metadata || {},
        thumbnailTimestampPct: 0.5, // サムネイルは動画の50%地点から生成
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stream copyFromR2 error:', errorText);
      throw new Error(
        `Stream API error: ${response.status} ${response.statusText}`
      );
    }

    const data: StreamUploadViaLinkResponse = await response.json();

    if (!data.success) {
      throw new Error(
        `Stream API failed: ${data.errors.map((e) => e.message).join(', ')}`
      );
    }

    return data.result;
  }

  /**
   * Stream動画の情報を取得
   * @param streamUid - Stream UID
   * @returns Stream動画情報
   */
  async getVideo(streamUid: string): Promise<StreamVideo> {
    const response = await fetch(`${this.baseUrl}/${streamUid}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Stream API error: ${response.status} ${response.statusText}`
      );
    }

    const data: StreamUploadViaLinkResponse = await response.json();

    if (!data.success) {
      throw new Error(
        `Stream API failed: ${data.errors.map((e) => e.message).join(', ')}`
      );
    }

    return data.result;
  }

  /**
   * Stream動画を削除
   * @param streamUid - Stream UID
   */
  async deleteVideo(streamUid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${streamUid}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Stream API error: ${response.status} ${response.statusText}`
      );
    }
  }
}

/**
 * StreamManagerのシングルトンインスタンス
 */
export const streamManager = new StreamManager();
