# Native Wi-Fi upload queue

## When the sheet appears
- Wi-Fi / Ethernet: enqueue immediately (no choice sheet).
- Cellular / other: `UploadChoiceSheet` (send now vs wait for Wi-Fi).

## Queue
- Persisted `upload-queue.json` in documentDirectory. Status `pending` | `failed` (missing status = pending).
- Bytes: Expo module `wifi-constrained-uploader` (iOS URLSession / Android WorkManager).
- Needs session token; mints presigned URL against `WEB_APP_URL`.

## Web pending cells
- Snapshot: `GET_PENDING_UPLOADS` → event `native:pendingUploads`.
- Live events: `native:uploadQueued` | `uploadFailed` | `uploadCancelled` | `uploadComplete` | `queueProcessed` | `networkState`.
- Cell tap:
  - `failed` → retry dialog (もう一度送る / 取り消す / 閉じる)
  - `pending` → `GET_NETWORK_STATE`; retry+cancel only if currently Wi-Fi; otherwise cancel-only confirm
- Preview cell: `album-detail-pending-photo-cell.tsx` (thin overlay, not a committed photo).

## Notifications
- Copy constants are duplicated: `src/lib/upload-notification-constants.ts` and `apps/native/src/upload/upload-notification-constants.ts` — keep in sync.
- Foreground: web toast (`NativeQueueProcessedToast`). Background: OS notification.
- Title/body: 「Wi-Fi接続を確認しました」 / 「{count}件をアルバムに追加しました」
