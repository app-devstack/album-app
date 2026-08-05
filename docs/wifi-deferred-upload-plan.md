# Wi-Fi 接続時アップロード / 遅延アップロード 方針

---
date: 2026-08-05
tags: [upload, wifi, offline, r2, planning]
project: album-app
---

## 背景

出先や通信制限下での写真アップロードに抵抗がある、というユーザー声がある。  
任意（設定 or アップロード時ダイアログ）で **Wi-Fi 接続時にアップロード** できるようにしたい。

## 結論（先に）

| 疑問 | 答え |
|------|------|
| Cloudflare 側で「Wi-Fi 復活まで待って非同期アップロード」できるか？ | **ほぼ不要・できない**（端末の回線種別はサーバーが知らない／ファイルがまだ端末にある） |
| 外部サービスは必要か？ | **不要**（既存の Presigned URL → R2 PUT → metadata POST のまま） |
| ハイブリッドアプリ（Capacitor 等）は必要か？ | **MVP では不要**。Web だけで十分着手できる |
| まず何をするか？ | **クライアント側のアップロードキュー + UI 選択** |

現状のアップロードはすでにクライアント起点である。

```
[ブラウザ] upload-url 取得 → R2 へ PUT → photos metadata POST
```

実装箇所の中心は `src/hooks/fetchers/use-photos.ts` の `createPhoto` と、  
`src/components/album-detail/album-detail.tsx` の `handleAddMediaBatch`。

Cloudflare Queues / Workflows は「サーバーに届いた後の後処理」向けであり、  
**「端末に残っている写真を Wi-Fi まで待つ」問題は解決しない。**

---

## 案の比較（パッとできる順）

### 案 A（推奨・最短）: ダイアログで「今すぐ / Wi-Fi で後で」

**やること**

1. メディア追加ダイアログ（またはファイル選択直後）で選択:
   - 「今すぐアップロード」
   - 「Wi-Fi 接続時にアップロード」
2. 後者は `IndexedDB`（または OPFS）に Blob + メタ（albumId, fileName, mediaType, addedAt）を保存
3. `online` / `visibilitychange` /（可能なら）`navigator.connection` を見てキューを消化
4. 消化時は **既存の `createPhoto` と同じ API フロー**（Presigned URL は有効期限があるので、実行時に再取得）

**メリット**

- サーバー変更ほぼゼロ
- 外部サービス不要
- ユーザーが明示的に選べる（抵抗感の直接解決）
- 既存ダイアログに一文ある「Wi-Fi 環境での追加をおすすめ」を行動に変えられる

**注意点**

- iOS Safari は `navigator.connection`（Network Information API）が弱い／未対応が多い  
  → 「Wi-Fi 判定」は完璧にできない場合がある  
  → **ユーザー選択を正**にし、判定は補助にする
- タブを閉じても残すなら IndexedDB 必須（メモリ上の `File` だけでは消える）
- 端末のストレージ上限・古いキューの掃除（TTL）が必要

**工数目安**: 小〜中（UI + キューストア + 再開フック）

---

### 案 B: 設定のトグル「モバイル回線ではアップロードしない」

**やること**

- 設定画面にトグルを追加（localStorage / 将来はユーザー設定を D1 に）
- ON のとき、非 Wi-Fi（または判定不能時は確認ダイアログ）なら自動でキューへ

**メリット**

- 毎回聞かなくてよい
- 案 A と併用しやすい（デフォルト動作を設定、都度オーバーライドはダイアログ）

**注意点**

- 案 A と同じく回線判定のブラウザ差がある
- 設定 UI 追加が必要（現状設定はテーマ・アカウント中心）

**工数目安**: 案 A に +小

---

### 案 C: Service Worker + Background Sync

**やること**

- SW に Background Sync / Periodic Background Sync でオンライン復帰時に送信

**メリット**

- アプリを開いていなくても送れそう、に見える

**デメリット（このプロジェクトでは後回し推奨）**

- iOS Safari のサポートが弱い
- PWA / SW の導入・デバッグコストが大きい
- Vinext / Workers 配信との相性確認が別途必要
- 「パッとできる」から外れる

**工数目安**: 中〜大

---

### 案 D: Capacitor / ネイティブラップ

**やること**

- ネイティブのネットワーク種別 API で正確な Wi-Fi 判定、バックグラウンド転送

**メリット**

- 回線判定と OS 連携が強い

**デメリット**

- ストア配布・証明書・更新フローが新たに発生
- 学習コストが高く、今回の「まずパッと」には不向き
- Cloudflare 以外というより **別プロダクト化** に近い

**工数目安**: 大（今回は見送り推奨）

---

### 案 E: Cloudflare Queues / Workflows でサーバー遅延

**やること（想定されがちな誤解）**

- サーバーに一度上げて、あとで R2 へ移す / 処理する

**なぜ今回の本命にならないか**

1. ユーザーが避けたいのは **そもそもモバイル回線でバイナリを送ること**
2. サーバーに載せる時点で通信コストは発生している
3. Wi-Fi 判定はクライアントにしかない

Queues が生きるのは、例えば「アップロード後のサムネ生成・通知」など **到達後の非同期処理**。  
今回の「Wi-Fi まで待つ」とは別問題。

---

## 推奨ロードマップ

### Phase 1（すぐ価値が出る）

1. アップロード時ダイアログに **「今すぐ」/「Wi-Fi で後で」** を追加（案 A）
2. IndexedDB キュー + オンライン復帰時の再実行
3. アルバム詳細に「待機中 N 件」と手動「今すぐ送信」ボタン
4. Presigned URL はキュー消化時に都度取得（既存 1h 期限を前提に設計）

### Phase 2

1. 設定トグル「可能な限り Wi-Fi のみ」（案 B）
2. 動画だけデフォルト Wi-Fi（画像は今すぐ、など）— 動画は最大 500MB 想定で効果大
3. 失敗リトライ（指数バックオフ）と期限切れキューの掃除

### Phase 3（必要なら）

1. PWA / Background Sync（案 C）を Android 中心に検討
2. どうしても iOS のバックグラウンド必須ならネイティブ検討（案 D）

---

## 技術メモ（このリポジトリ向け）

### 触る想定ファイル

| 領域 | ファイル |
|------|----------|
| アップロード本体 | `src/hooks/fetchers/use-photos.ts` |
| バッチ UI | `src/components/album-detail/album-detail.tsx` |
| 追加ダイアログ | `src/components/album-detail/album-detail-add-media-dialog.tsx` |
| 新規 | `src/lib/upload-queue/`（IndexedDB ストア + drain） |
| 設定（Phase 2） | `src/components/pages/SettingsPage` 周辺 |

### サーバー（Cloudflare）側

- **API 契約はそのままでよい**
  - `POST /api/photos/album/:albumId/upload-url`
  - `PUT`（signedUrl / upload-buffer）
  - `POST /api/photos/album/:albumId`
- R2 / D1 / Workers の追加バインディングは Phase 1 では不要
- 将来、キューメタをサーバーに持ちたい場合のみ D1 テーブル検討（Blob 本体は引き続きクライアント）

### Wi-Fi 判定の現実的な扱い

```ts
// イメージ（擬似コード）
function canUploadNow(preferWifi: boolean): boolean {
  if (!navigator.onLine) return false;
  if (!preferWifi) return true;

  const conn = (navigator as Navigator & {
    connection?: { type?: string; effectiveType?: string; saveData?: boolean };
  }).connection;

  // Chromium 系のみ比較的使える
  if (conn?.type === 'wifi' || conn?.type === 'ethernet') return true;
  if (conn?.type === 'cellular') return false;

  // 判定不能（特に iOS）→ ユーザー選択 or 確認ダイアログにフォールバック
  return 'unknown';
}
```

**方針**: 自動判定を過信せず、「ユーザーが Wi-Fi で後でを選んだ」ことをキュー条件の主キーにする。

### UX の最低ライン

- 待機中アイテムの一覧（ファイル名、アルバム、追加時刻）
- 「今すぐアップロード」（モバイル回線でも送る明示操作）
- 「キャンセル」（キューから削除。端末 Blob も削除）
- 送信完了トースト / 失敗時の再試行

---

## やらないこと（Phase 1）

- Capacitor / ネイティブラップ
- Cloudflare Queues による「Wi-Fi 待ち」
- 外部アップロード基盤（Uploadcare 等）
- Service Worker 必須化

---

## 決定が必要なこと（実装前の確認）

1. Phase 1 は **ダイアログ選択のみ**でよいか、最初から **設定トグル**も入れるか
2. デフォルトは「今すぐ」か「Wi-Fi で後で」か（動画だけ後者、など）
3. タブを閉じたあとも必ず送るか（IndexedDB 必須）／開いている間だけでよいか
4. 待機中の写真をアルバム UI にプレースホルダ表示するか

推奨デフォルト:

1. ダイアログ選択（デフォルト「今すぐ」、動画は「Wi-Fi 推奨」を強調）
2. IndexedDB でタブ再訪問後も再開
3. プレースホルダは Phase 1 では簡易（件数バッジ + 待機リスト）で十分
