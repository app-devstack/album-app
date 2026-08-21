# Cloudflare R2 への CRUD

本ドキュメントは、Cloudflare R2 を **S3 互換 API（AWS SDK v3）** と **ランタイムの R2 バインディング** の両方で扱う際の要点をまとめたものです（このリポジトリの `src/lib/r2.ts` と同系統のパターン）。

## 前提

- `wrangler.jsonc` に `r2_buckets` を定義し、バインディング名（例: `R2`）で Worker に渡す。
- **サーバー側でオブジェクトを読み書きする**ときは `R2Bucket`（バインディング）が扱いやすい。
- **クライアントに直接アップロード／ダウンロードさせる**ときは **Presigned URL**（S3 クライアント + API トークン）が一般的。

シークレット例（環境変数・Wrangler Secret など）:

- `CLOUDFLARE_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`（S3 API 用）

エンドポイントは `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`、リージョンは `auto`。

## Create（アップロード）

### 方式 A: Presigned PUT（クライアントが直接 R2 に PUT）

1. サーバーでオブジェクトキーと `ContentType` を決める。
2. `PutObjectCommand` + `getSignedUrl` で **署名付き PUT URL** を発行する。
3. クライアントがその URL に `PUT` する。

メリット: Worker のメモリに大きなボディを載せない。

### 方式 B: バインディングで直接 put（サーバーが受け取ったバイナリを保存）

`env.R2`（型 `R2Bucket`）に対して `put(key, body, options)` を呼ぶ。`httpMetadata.contentType` や `customMetadata` を付与できる。

## Read（取得）

### 方式 A: Presigned GET（一時 URL でブラウザやクライアントが取得）

`GetObjectCommand` + `getSignedUrl` で **署名付き GET URL** を返す。

### 方式 B: バインディングで get（Worker 内でバイト列が必要なとき）

`r2Bucket.get(key)` → `arrayBuffer()` などで本文を読む。`httpMetadata` から `Content-Type` を解釈する。

## Update

R2/S3 では「同じキーへの Put で上書き」が実質の更新。メタデータだけ変えたい場合も、実装によっては **新しいオブジェクトを Put して古いキーを Delete** するパターンになる。

## Delete（削除）

S3 クライアントで `DeleteObjectCommand` を実行する（本リポジトリの `r2Manager.delete` と同様）。バインディング経由の削除 API を使う構成も可能。

## 設計上の注意

- **キー設計**: プレフィックスで用途を分ける（例: `albums/<albumId>/...`）。衝突回避にタイムスタンプや UUID を付与する。
- **検証**: MIME とサイズ上限は API 層で検証し、Presigned URL 発行前に拒否する。
- **Workers 制約**: 大きなファイルは **Presigned でクライアント直送** か **ストリーミング** を検討し、Worker 全体のメモリ・CPU 制限に注意する。

## 参照ファイル（このリポジトリ）

- `src/lib/r2.ts` — S3 クライアント、Presigned、バインディング経由の upload/get/delete
- `wrangler.jsonc` — `r2_buckets` バインディング
