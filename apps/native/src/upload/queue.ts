import * as FileSystem from 'expo-file-system/legacy';

const QUEUE_FILE = `${FileSystem.documentDirectory ?? ''}upload-queue.json`;

/** キュー項目の処理状態。未設定は pending 扱い。 */
export type QueueItemStatus = 'pending' | 'failed';

/** 永続化キューに保存するアップロード項目。 */
export interface QueueItem {
  id: string;
  r2Key: string;
  expiresAt: number;
  albumId: string;
  filePath: string;
  mediaType: 'image' | 'video';
  wifiOnly: boolean;
  contentType: string;
  filename: string;
  alt?: string;
  nativeUploadId: string;
  duration?: number;
  status?: QueueItemStatus; // 未設定は pending 扱い（既存キュー互換）
  r2PutSucceeded?: boolean; // PUT 成功後の登録失敗時に true
}

/** 項目の実効 status を返す（未設定は pending）。 */
export function getQueueItemStatus(item: QueueItem): QueueItemStatus {
  return item.status ?? 'pending';
}

async function readQueue(): Promise<QueueItem[]> {
  if (!FileSystem.documentDirectory) {
    return [];
  }

  const info = await FileSystem.getInfoAsync(QUEUE_FILE);
  if (!info.exists) {
    return [];
  }

  const raw = await FileSystem.readAsStringAsync(QUEUE_FILE);
  if (!raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as QueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueueItem[]): Promise<void> {
  if (!FileSystem.documentDirectory) {
    return;
  }

  await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(items));
}

/** キュー項目を追加する。 */
export async function addQueueItem(item: QueueItem): Promise<void> {
  const items = await readQueue();
  items.push(item);
  await writeQueue(items);
}

/** キュー項目 ID で取得する。 */
export async function getQueueItemById(
  id: string
): Promise<QueueItem | undefined> {
  const items = await readQueue();
  return items.find((item) => item.id === id);
}

/** ネイティブアップロード ID でキュー項目を取得する。 */
export async function getQueueItemByNativeId(
  nativeUploadId: string
): Promise<QueueItem | undefined> {
  const items = await readQueue();
  return items.find((item) => item.nativeUploadId === nativeUploadId);
}

/** キュー項目を ID で削除する。 */
export async function removeQueueItem(id: string): Promise<void> {
  const items = await readQueue();
  await writeQueue(items.filter((item) => item.id !== id));
}

/** キュー項目を更新する。 */
export async function updateQueueItem(
  id: string,
  patch: Partial<QueueItem>
): Promise<void> {
  const items = await readQueue();
  await writeQueue(
    items.map((item) => (item.id === id ? { ...item, ...patch } : item))
  );
}

/** キュー内の全項目を取得する。 */
export async function getAllQueueItems(): Promise<QueueItem[]> {
  return readQueue();
}
