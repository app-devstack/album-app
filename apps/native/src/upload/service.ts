import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Alert, AppState, type AppStateStatus } from 'react-native';

import { getSessionToken } from '../auth/token-store';
import { WEB_APP_URL } from '../config';
import WifiConstrainedUploader from '../../modules/wifi-constrained-uploader';
import { createPendingPreview } from './create-pending-preview';
import { isWifiOrEthernet } from './is-wifi-or-ethernet';
import {
  addQueueItem,
  getAllQueueItems,
  getQueueItemById,
  getQueueItemByNativeId,
  getQueueItemStatus,
  removeQueueItem,
  updateQueueItem,
  type QueueItem,
} from './queue';
import {
  QUEUE_PROCESSED_BODY_TEMPLATE,
  QUEUE_PROCESSED_NOTIFICATION_TITLE,
} from './upload-notification-constants';

/** WebView へ渡す Wi-Fi 待機キューのプレビュー項目。 */
export type NativePendingUploadItem = {
  id: string;
  mediaType: 'image' | 'video';
  previewDataUrl: string;
  status: 'pending' | 'failed';
};

/** WebView 参照（injectJavaScript 用）。 */
export type UploadWebViewRef = {
  injectJavaScript: (script: string) => void;
} | null;

let webViewRef: UploadWebViewRef = null;
let initialized = false;
let uploadEventChain: Promise<void> = Promise.resolve();
let wifiQueueProcessedCount = 0;

/** 送信待ちキュー完了通知の表示設定。 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** WebView 参照をアップロードサービスへ渡す。 */
export function setUploadWebViewRef(ref: UploadWebViewRef): void {
  webViewRef = ref;
}

/** 選択ファイルをキューへ投入する。 */
export async function enqueueUpload(params: {
  albumId: string;
  uri: string;
  filename: string;
  contentType: string;
  mediaType: 'image' | 'video';
  wifiOnly: boolean;
  alt?: string;
  duration?: number;
}): Promise<void> {
  const token = await getSessionToken();
  if (!token) {
    Alert.alert(
      'ログインが必要です',
      'Web アプリでログインしてから、もう一度お試しください。'
    );
    return;
  }

  if (!FileSystem.documentDirectory) {
    throw new Error('documentDirectory is unavailable');
  }

  const uploadsDir = `${FileSystem.documentDirectory}uploads/`;
  await FileSystem.makeDirectoryAsync(uploadsDir, { intermediates: true });

  const safeName = params.filename.replace(/[^\w.\-]/g, '_');
  const destPath = `${uploadsDir}${Date.now()}-${safeName}`;

  await FileSystem.copyAsync({ from: params.uri, to: destPath });

  const info = await FileSystem.getInfoAsync(destPath);
  if (!info.exists || !('size' in info) || info.size == null) {
    throw new Error('Failed to copy picked file');
  }

  const mintBody: Record<string, unknown> = {
    filename: params.filename,
    contentType: params.contentType,
    fileSize: info.size,
  };
  if (params.wifiOnly) {
    mintBody.expiresIn = 86400;
  }

  const mintRes = await fetch(
    `${WEB_APP_URL}/api/photos/album/${params.albumId}/upload-url`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mintBody),
    }
  );

  if (!mintRes.ok) {
    await FileSystem.deleteAsync(destPath, { idempotent: true });
    throw new Error(`upload-url failed (${mintRes.status})`);
  }

  const mintJson = (await mintRes.json()) as {
    signedUrl: string;
    key: string;
    expiresIn?: number;
  };

  const expiresIn = mintJson.expiresIn ?? 3600;
  const expiresAt = Date.now() + expiresIn * 1000;

  const { id: nativeUploadId } = await WifiConstrainedUploader.startUpload({
    filePath: destPath,
    url: mintJson.signedUrl,
    method: 'PUT',
    headers: { 'Content-Type': params.contentType },
    network: params.wifiOnly ? 'wifi-only' : 'any',
  });

  const queueItem: QueueItem = {
    id: nativeUploadId,
    r2Key: mintJson.key,
    expiresAt,
    albumId: params.albumId,
    filePath: destPath,
    mediaType: params.mediaType,
    wifiOnly: params.wifiOnly,
    contentType: params.contentType,
    filename: params.filename,
    alt: params.alt ?? params.filename.replace(/\.[^.]+$/, ''),
    nativeUploadId,
    duration: params.duration,
    status: 'pending',
  };

  await addQueueItem(queueItem);

  if (params.wifiOnly) {
    const pendingItem = await buildPendingUploadItem(queueItem);
    dispatchUploadQueued(params.albumId, pendingItem ?? undefined);
  }
}

/** キュー項目からプレビュー付き待機項目を組み立てる。 */
async function buildPendingUploadItem(
  queueItem: QueueItem
): Promise<NativePendingUploadItem | null> {
  const previewDataUrl = await createPendingPreview(
    queueItem.filePath,
    queueItem.mediaType
  );

  if (!previewDataUrl) {
    return null;
  }

  return {
    id: queueItem.id,
    mediaType: queueItem.mediaType,
    previewDataUrl,
    status: getQueueItemStatus(queueItem),
  };
}

/** WebView へ uploadQueued イベントを送る。 */
function dispatchUploadQueued(
  albumId: string,
  item?: NativePendingUploadItem
): void {
  const detail: { albumId: string; item?: NativePendingUploadItem } = {
    albumId,
  };

  if (item) {
    detail.item = item;
  }

  webViewRef?.injectJavaScript(
    `window.dispatchEvent(new CustomEvent('native:uploadQueued', { detail: ${JSON.stringify(detail)} })); true;`
  );
}

/** WebView へ uploadFailed イベントを送る。 */
function dispatchUploadFailed(albumId: string, id: string): void {
  const detail = { albumId, id };

  webViewRef?.injectJavaScript(
    `window.dispatchEvent(new CustomEvent('native:uploadFailed', { detail: ${JSON.stringify(detail)} })); true;`
  );
}

/** WebView へ uploadCancelled イベントを送る。 */
function dispatchUploadCancelled(albumId: string, id: string): void {
  const detail = { albumId, id };

  webViewRef?.injectJavaScript(
    `window.dispatchEvent(new CustomEvent('native:uploadCancelled', { detail: ${JSON.stringify(detail)} })); true;`
  );
}

/** 指定アルバムの wifiOnly 待機／失敗キューをプレビュー付きで取得する。 */
export async function getPendingWifiOnlyUploads(
  albumId: string
): Promise<NativePendingUploadItem[]> {
  const items = await getAllQueueItems();
  const wifiOnlyItems = items.filter(
    (item) => item.albumId === albumId && item.wifiOnly
  );

  const pendingItems: NativePendingUploadItem[] = [];

  for (const item of wifiOnlyItems) {
    const pendingItem = await buildPendingUploadItem(item);
    if (pendingItem) {
      pendingItems.push(pendingItem);
    }
  }

  return pendingItems;
}

/** WebView へ pendingUploads スナップショットを送る。 */
export async function dispatchPendingUploadsSnapshot(
  albumId: string
): Promise<void> {
  const items = await getPendingWifiOnlyUploads(albumId);

  webViewRef?.injectJavaScript(
    `window.dispatchEvent(new CustomEvent('native:pendingUploads', { detail: ${JSON.stringify({ albumId, items })} })); true;`
  );
}

async function mintUploadUrl(
  albumId: string,
  token: string,
  body: Record<string, unknown>
): Promise<{ signedUrl: string; key: string; expiresIn?: number }> {
  const res = await fetch(
    `${WEB_APP_URL}/api/photos/album/${albumId}/upload-url`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(`upload-url failed (${res.status})`);
  }

  return (await res.json()) as {
    signedUrl: string;
    key: string;
    expiresIn?: number;
  };
}

function waitForNativeUpload(uploadId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const completedSub = WifiConstrainedUploader.addListener(
      'completed',
      (event) => {
        if (event.id !== uploadId) {
          return;
        }
        completedSub.remove();
        failedSub.remove();
        resolve();
      }
    );

    const failedSub = WifiConstrainedUploader.addListener('failed', (event) => {
      if (event.id !== uploadId) {
        return;
      }
      completedSub.remove();
      failedSub.remove();
      reject(new Error(event.error ?? 'Thumbnail upload failed'));
    });
  });
}

async function uploadVideoThumbnail(
  item: QueueItem,
  token: string
): Promise<string | undefined> {
  if (!FileSystem.documentDirectory) {
    return undefined;
  }

  const { uri } = await VideoThumbnails.getThumbnailAsync(item.filePath, {
    time: 0,
  });

  const thumbPath = `${FileSystem.documentDirectory}uploads/thumb-${item.id}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: thumbPath });

  const info = await FileSystem.getInfoAsync(thumbPath);
  const fileSize =
    info.exists && 'size' in info && info.size != null ? info.size : 0;

  const mint = await mintUploadUrl(item.albumId, token, {
    filename: `thumb-${item.filename}.jpg`,
    contentType: 'image/jpeg',
    fileSize,
  });

  const { id: thumbUploadId } = await WifiConstrainedUploader.startUpload({
    filePath: thumbPath,
    url: mint.signedUrl,
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    network: 'any',
  });

  try {
    await waitForNativeUpload(thumbUploadId);
  } finally {
    await FileSystem.deleteAsync(thumbPath, { idempotent: true });
  }

  return mint.key;
}

/** WebView へ uploadComplete イベントを送る（OS 通知は出さない）。 */
function dispatchUploadComplete(albumId: string, id: string): void {
  const detail = { albumId, id };

  webViewRef?.injectJavaScript(
    `window.dispatchEvent(new CustomEvent('native:uploadComplete', { detail: ${JSON.stringify(detail)} })); true;`
  );
}

/** WebView へ queueProcessed イベントを送る。 */
function dispatchQueueProcessed(albumId: string, count: number): void {
  const detail = { albumId, count };

  webViewRef?.injectJavaScript(
    `window.dispatchEvent(new CustomEvent('native:queueProcessed', { detail: ${JSON.stringify(detail)} })); true;`
  );
}

/**
 * 送信待ちキューの pending が無くなったとき WebView に伝え、
 * バックグラウンドのときだけ OS 通知を出す。
 */
async function notifyQueueProcessed(
  albumId: string,
  count: number
): Promise<void> {
  if (count <= 0) {
    return;
  }

  dispatchQueueProcessed(albumId, count);

  if (AppState.currentState === 'active') {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: QUEUE_PROCESSED_NOTIFICATION_TITLE,
      body: QUEUE_PROCESSED_BODY_TEMPLATE.replace('{count}', String(count)),
    },
    trigger: null,
  });
}

/** 失敗としてキューを更新し、Wi-Fi 待ちなら WebView に伝える。 */
async function markItemFailed(
  item: QueueItem,
  patch: Partial<QueueItem> = {}
): Promise<void> {
  await updateQueueItem(item.id, {
    status: 'failed',
    ...patch,
  });

  if (item.wifiOnly) {
    dispatchUploadFailed(item.albumId, item.id);
  }
}

/** Wi-Fi 待ちの pending が残っていないとき成功件数を通知する。 */
async function maybeNotifyWifiQueueProcessed(albumId: string): Promise<void> {
  const remainingPending = (await getAllQueueItems()).filter(
    (queued) => queued.wifiOnly && getQueueItemStatus(queued) === 'pending'
  );
  if (remainingPending.length > 0) {
    return;
  }

  const processedCount = wifiQueueProcessedCount;
  wifiQueueProcessedCount = 0;
  await notifyQueueProcessed(albumId, processedCount);
}

/** アルバム登録 POST を実行する。 */
async function postPhotoMetadata(
  item: QueueItem,
  token: string
): Promise<void> {
  let thumbnailR2Key: string | undefined;
  if (item.mediaType === 'video') {
    try {
      thumbnailR2Key = await uploadVideoThumbnail(item, token);
    } catch {
      // サムネ失敗は本編成功扱い（Web 側と同じ）
    }
  }

  const body: Record<string, unknown> = {
    alt: item.alt ?? '',
    mediaType: item.mediaType,
    r2Key: item.r2Key,
  };
  if (thumbnailR2Key) {
    body.thumbnailR2Key = thumbnailR2Key;
  }
  if (item.duration != null) {
    body.duration = item.duration;
  }

  const res = await fetch(`${WEB_APP_URL}/api/photos/album/${item.albumId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`POST /photos failed (${res.status})`);
  }
}

/** ネイティブ PUT 完了後にメタデータ POST と後処理を行う。 */
export async function handleUploadCompleted(
  nativeUploadId: string
): Promise<void> {
  const item = await getQueueItemByNativeId(nativeUploadId);
  if (!item) {
    return;
  }

  const token = await getSessionToken();
  if (!token) {
    await markItemFailed(item, { r2PutSucceeded: true });
    return;
  }

  try {
    await postPhotoMetadata(item, token);
  } catch {
    await markItemFailed(item, { r2PutSucceeded: true });
    return;
  }

  const wifiOnly = item.wifiOnly;

  await FileSystem.deleteAsync(item.filePath, { idempotent: true });
  dispatchUploadComplete(item.albumId, item.id);
  await removeQueueItem(item.id);

  if (!wifiOnly) {
    return;
  }

  wifiQueueProcessedCount += 1;
  await maybeNotifyWifiQueueProcessed(item.albumId);
}

/** ネイティブ PUT 失敗時のキュー項目を更新する。 */
export async function handleUploadFailed(
  nativeUploadId: string,
  _error?: string
): Promise<void> {
  const item = await getQueueItemByNativeId(nativeUploadId);
  if (!item) {
    return;
  }

  if (getQueueItemStatus(item) !== 'pending') {
    return;
  }

  await markItemFailed(item, { r2PutSucceeded: false });
}

/** キュー項目を取り消し、プレビューを外す。 */
export async function cancelQueuedUpload(id: string): Promise<void> {
  const item = await getQueueItemById(id);
  if (!item) {
    return;
  }

  const albumId = item.albumId;
  const wifiOnly = item.wifiOnly;

  await removeQueueItem(item.id);

  try {
    await WifiConstrainedUploader.cancelUpload(item.nativeUploadId);
  } catch {
    // すでに完了／停止している場合は無視する
  }

  await FileSystem.deleteAsync(item.filePath, { idempotent: true });

  if (wifiOnly) {
    dispatchUploadCancelled(albumId, id);
    await maybeNotifyWifiQueueProcessed(albumId);
  }
}

/** 待機中または失敗した 1 件を手動再送する。 */
export async function retryQueuedUpload(id: string): Promise<void> {
  const item = await getQueueItemById(id);
  if (!item) {
    return;
  }

  const status = getQueueItemStatus(item);
  if (status !== 'pending' && status !== 'failed') {
    return;
  }

  if (item.wifiOnly) {
    const onWifi = await isWifiOrEthernet();
    if (!onWifi) {
      return;
    }
  }

  await retryFailedItem(item, { notifyOnSuccess: false });
}

/** PUT 成功済みなら登録のみ、未完了なら URL 再取得から再送する。 */
async function retryFailedItem(
  item: QueueItem,
  options?: { notifyOnSuccess?: boolean }
): Promise<void> {
  const notifyOnSuccess = options?.notifyOnSuccess !== false;
  const token = await getSessionToken();
  if (!token) {
    return;
  }

  const info = await FileSystem.getInfoAsync(item.filePath);
  if (!info.exists || !('size' in info) || info.size == null) {
    await cancelQueuedUpload(item.id);
    return;
  }

  if (item.r2PutSucceeded) {
    await updateQueueItem(item.id, { status: 'pending' });
    if (item.wifiOnly) {
      const pendingItem = await buildPendingUploadItem({
        ...item,
        status: 'pending',
      });
      if (pendingItem) {
        dispatchUploadQueued(item.albumId, pendingItem);
      }
    }

    try {
      await postPhotoMetadata(item, token);
    } catch {
      await markItemFailed(item, { r2PutSucceeded: true });
      return;
    }

    const wifiOnly = item.wifiOnly;
    await FileSystem.deleteAsync(item.filePath, { idempotent: true });
    dispatchUploadComplete(item.albumId, item.id);
    await removeQueueItem(item.id);

    if (wifiOnly && notifyOnSuccess) {
      wifiQueueProcessedCount += 1;
      await maybeNotifyWifiQueueProcessed(item.albumId);
    }
    return;
  }

  const oldNativeUploadId = item.nativeUploadId;
  const status = getQueueItemStatus(item);

  const mintBody: Record<string, unknown> = {
    filename: item.filename,
    contentType: item.contentType,
    fileSize: info.size,
  };
  if (item.wifiOnly) {
    mintBody.expiresIn = 86400;
  }

  let mint: { signedUrl: string; key: string; expiresIn?: number };
  try {
    mint = await mintUploadUrl(item.albumId, token, mintBody);
  } catch {
    if (status === 'failed') {
      await markItemFailed(item, { r2PutSucceeded: false });
    }
    return;
  }

  const expiresIn = mint.expiresIn ?? 3600;
  const { id: nativeUploadId } = await WifiConstrainedUploader.startUpload({
    filePath: item.filePath,
    url: mint.signedUrl,
    method: 'PUT',
    headers: { 'Content-Type': item.contentType },
    network: item.wifiOnly ? 'wifi-only' : 'any',
  });

  await updateQueueItem(item.id, {
    status: 'pending',
    r2Key: mint.key,
    expiresAt: Date.now() + expiresIn * 1000,
    nativeUploadId,
    r2PutSucceeded: false,
  });

  try {
    await WifiConstrainedUploader.cancelUpload(oldNativeUploadId);
  } catch {
    // すでに完了／停止している場合は無視する
  }

  if (item.wifiOnly) {
    const pendingItem = await buildPendingUploadItem({
      ...item,
      status: 'pending',
      r2Key: mint.key,
      nativeUploadId,
    });
    if (pendingItem) {
      dispatchUploadQueued(item.albumId, pendingItem);
    }
  }
}

/** 期限切れキュー項目の Presigned URL を再 mint して再 enqueue する。 */
export async function refreshExpiredQueueItems(): Promise<void> {
  const token = await getSessionToken();
  if (!token) {
    return;
  }

  const now = Date.now();
  const items = await getAllQueueItems();

  for (const item of items) {
    if (getQueueItemStatus(item) === 'failed') {
      continue;
    }
    if (item.expiresAt > now) {
      continue;
    }

    const info = await FileSystem.getInfoAsync(item.filePath);
    if (!info.exists || !('size' in info) || info.size == null) {
      await removeQueueItem(item.id);
      continue;
    }

    const mintBody: Record<string, unknown> = {
      filename: item.filename,
      contentType: item.contentType,
      fileSize: info.size,
    };
    if (item.wifiOnly) {
      mintBody.expiresIn = 86400;
    }

    let mint: { signedUrl: string; key: string; expiresIn?: number };
    try {
      mint = await mintUploadUrl(item.albumId, token, mintBody);
    } catch {
      continue;
    }

    const expiresIn = mint.expiresIn ?? 3600;
    const { id: nativeUploadId } = await WifiConstrainedUploader.startUpload({
      filePath: item.filePath,
      url: mint.signedUrl,
      method: 'PUT',
      headers: { 'Content-Type': item.contentType },
      network: item.wifiOnly ? 'wifi-only' : 'any',
    });

    await updateQueueItem(item.id, {
      r2Key: mint.key,
      expiresAt: Date.now() + expiresIn * 1000,
      nativeUploadId,
      status: 'pending',
    });
  }
}

/** ネイティブ側に存在しない pending 項目を failed に更新する。 */
async function markOrphanPendingItemsFailed(): Promise<void> {
  let activeIds: Set<string>;
  try {
    activeIds = new Set(await WifiConstrainedUploader.getActiveUploadIds());
  } catch {
    return;
  }
  const items = await getAllQueueItems();

  for (const item of items) {
    if (getQueueItemStatus(item) !== 'pending') {
      continue;
    }
    if (activeIds.has(item.nativeUploadId)) {
      continue;
    }
    await markItemFailed(item);
  }
}

/** 前面復帰時に reattach・期限切れ更新・孤立 pending の failed 化を行う。 */
async function onAppBecameActive(): Promise<void> {
  await WifiConstrainedUploader.reattach();
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
  await uploadEventChain;
  await refreshExpiredQueueItems();
  await markOrphanPendingItemsFailed();
}

/** アップロードサービスのリスナーと AppState 監視を初期化する。 */
export function initUploadService(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  WifiConstrainedUploader.addListener('completed', (event) => {
    uploadEventChain = uploadEventChain
      .then(() => handleUploadCompleted(event.id))
      .catch(() => {});
  });

  WifiConstrainedUploader.addListener('failed', (event) => {
    uploadEventChain = uploadEventChain
      .then(() => handleUploadFailed(event.id, event.error))
      .catch(() => {});
  });

  const onAppStateChange = (state: AppStateStatus) => {
    if (state === 'active') {
      void onAppBecameActive();
    }
  };

  AppState.addEventListener('change', onAppStateChange);
}

/** 起動時にサービスを初期化し前面復帰フローを実行する。 */
export async function bootstrapUploadService(): Promise<void> {
  initUploadService();
  await onAppBecameActive();
}
