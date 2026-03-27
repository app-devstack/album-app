# Album App - AI Coding Agent Instructions

## アーキテクチャ概要

このプロジェクトは**Cloudflare Pages + Vinext**を使用したフルスタックNext.jsアプリケーションです。通常のNext.jsデプロイではなく、Cloudflare Workers上でSSRを実行する独自のアーキテクチャを採用しています。

### 主要コンポーネント

- **フロントエンド**: Next.js 16 (App Router) + React 19 + shadcn/ui
- **バックエンド**: Hono API (`src/app/api/[[...route]]/route.ts`)
- **データベース**: Cloudflare D1 (SQLite) + Drizzle ORM
- **ストレージ**: Cloudflare R2 (S3互換、AWS SDK v3で操作)
- **デプロイ**: Cloudflare Workers経由でVinextがレンダリング
- **画像最適化**: Cloudflare Images binding (`worker/index.ts`内の`/_vinext/image`エンドポイント)
- **状態管理**: TanStack React Query v5 (`src/hooks/fetchers/`)

## 重要な技術的決定事項

### 1. Vinext統合による二重ビルドシステム

- `pnpm dev`: 通常のNext.js開発サーバー（localhost:3000）
- `pnpm dev:vinext`: Viteベースのプレビュー（localhost:3001）- Cloudflare環境をエミュレート
- `pnpm build:vinext`: Cloudflare Workers用の本番ビルド

**重要**: `worker/index.ts`はVinextが自動生成するが、手動編集も可能。画像最適化ロジックが含まれる。

### 2. データベース接続パターン

**ランタイム（Honoルーター）**: Cloudflare Workersのbindingsを通じてアクセス

```typescript
// ✅ 正しい方法 - src/db/index.ts
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';

const db = drizzle(env.DB, { schema });
export default db;

// ✅ Honoルーターでの使用例 - src/app/api/[[...route]]/routes/albums.ts
import db from '@/db';
import { albums } from '@/db/schema';
const allAlbums = await db.select().from(albums).all();
```

**開発時（スキーマ操作のみ）**: HTTPベースのD1クライアント

```typescript
// ✅ drizzle.config.ts
export default defineConfig({
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
```

### 3. スキーマ駆動開発ワークフロー

データモデルの変更フロー:

1. `src/db/schema.ts`を編集
2. `npx drizzle-kit generate` - SQLマイグレーションファイルを`drizzle/`に生成
3. `npx wrangler d1 migrations apply album-app-db --remote` - リモートDBに適用
4. `pnpm run cf-typegen` - TypeScript型定義を更新（`worker-configuration.d.ts`）

**注意**:
- `wrangler.jsonc`の`d1_databases[0].migrations_dir`は`./drizzle/`を指定済み
- Drizzleの型エクスポートは自動生成: `export type Album = typeof albums.$inferSelect;`

### 4. API層の設計パターン（Hono + React Query）

APIは`src/app/api/[[...route]]/route.ts`でHonoを使用して実装:

```typescript
// ✅ Honoルート定義（各ルーターは独立したファイルで管理）
// src/app/api/[[...route]]/routes/albums.ts
import { createApp } from '@/lib/api';
import { zValidator } from '@hono/zod-validator';

const router = createApp();
export const albumsRouter = router
  .get('/', async (c) => { /* ... */ })
  .post('/', zValidator('json', createAlbumSchema), async (c) => { /* ... */ });
```

フロントエンドからは型安全なHonoクライアント（`src/lib/api.ts`）を使用:

```typescript
// ✅ クライアント側
import { api } from '@/lib/api';
const res = await api.albums[':id'].$get({ param: { id } });
```

React Queryフックは`src/hooks/fetchers/`で統一的に管理。QueryKeyパターン:

```typescript
export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  detail: (id: string) => [...albumKeys.all, 'detail', id] as const,
};
```

## コーディング規約

### UIコンポーネント

- **shadcn/ui**: `components.json`でNew York styleを使用
- **インストール**: `npx shadcn@latest add <component-name>`でコンポーネント追加
- **クライアントコンポーネント**: インタラクティブなUI（例: `src/components/album-card.tsx`）には`'use client'`を明示

### インポートエイリアス

```typescript
@/components → src/components
@/lib → src/lib
@/db → src/db
@/hooks → src/hooks
```

### スタイリング

- Tailwind CSS v4（PostCSS統合）
- クラス結合には`cn()`ユーティリティを使用（`src/lib/utils.ts`から）
- ダークモード対応: `next-themes`でシステム/ライト/ダーク切り替え
- 日本語フォント: Noto Sans JP（UI）とNoto Serif JP（装飾）を使用

## 開発ワークフロー

### 開発サーバーの起動

```bash
pnpm dev              # 通常のNext.js開発サーバー（localhost:3000）
pnpm dev:vinext       # Cloudflare環境エミュレート（localhost:3001）
pnpm build            # Next.js本番ビルド
pnpm build:vinext     # Cloudflare Workers用ビルド
pnpm deploy:vinext    # Cloudflareへデプロイ
```

### データベース操作

```bash
npx drizzle-kit generate          # マイグレーションファイル生成
npx wrangler d1 migrations apply album-app-db --remote  # リモートDB適用
pnpm run cf-typegen               # TypeScript型定義更新
```

### 新しいコンポーネント追加

```bash
npx shadcn@latest add <component-name>
```

### 型エラーについて

`next.config.mjs`で`typescript.ignoreBuildErrors: true`が設定済み。これは開発速度を優先するためですが、本番前には型エラーを解消すべきです。

### 画像処理

- `next/image`の`unoptimized: true`設定により、Next.jsビルトインの最適化は無効
- 代わりに`worker/index.ts`の`/_vinext/image`エンドポイントでCloudflare Imagesを使用

### R2アップロードパターン

Presigned URL方式を採用（`src/app/api/[[...route]]/routes/photos.ts`参照）:
1. `/api/albums/:albumId/photos/upload-url` で署名付きURLを取得
2. クライアントから直接R2へアップロード
3. アップロード後、`/api/albums/:albumId/photos`にメタデータを登録

## トラブルシューティング

### D1マイグレーションエラー

`migrations_dir`が見つからない場合、`wrangler.jsonc`の`d1_databases[0].migrations_dir`が正しく設定されているか確認。

### 環境変数

以下の環境変数が必要（Drizzle Kit用、`.env`ファイルに記述）:
- `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID
- `CLOUDFLARE_DATABASE_ID`: D1データベースID
- `CLOUDFLARE_D1_TOKEN`: D1 API token

実行時の環境変数（DB、R2など）は`wrangler.jsonc`のbindingsで管理。

### Cloudflare Secrets管理

機密情報（R2認証情報など）はWrangler Secretsで管理:
```bash
pnpm run secrets:upload  # scripts/upload-secrets.shを実行
# または個別に
npx wrangler secret put R2_ACCESS_KEY_ID
```

## プロジェクト固有パターン

### データモデル構造

- **リレーションシップ**: albums → photos/memos（CASCADE DELETE）
- **JSON型の扱い**: `sharedWith`などのJSON配列は文字列として保存（`text('shared_with')`）- SQLiteの制約
- **日付フィールド**: Drizzleの`sql`タグで`date('now')`をデフォルト値に使用
- **メディアタイプ**: `photos.mediaType`で`image`/`video`を区別、`duration`フィールドで動画の長さを保存

### 個人/家族アルバムの違い

- `type: 'personal'`: プライベート、単独作成者
- `type: 'family'`: 共有、`sharedWith`配列でメンバー管理、`memberAvatar`/`memberName`表示

## 実装プロンプト作成ガイドライン

このプロジェクトでは、大規模な実装タスクを段階的に進めるために**実装プロンプト（Implementation Guide）**を活用します。

### プロンプトの保存場所と命名規則

```
./prompts/
  ├── 00_migration-shared-with-to-user-ids/
  │   └── impl-guide.md
  ├── 01_unify-drizzle-generated-types/
  │   └── impl-guide.md
  ├── 02_次のタスク名/
  │   └── impl-guide.md
  └── ...
```

**ルール**:

- `./.prompts/`ディレクトリ配下に番号付きフォルダを作成
- フォルダ名: `00_`, `01_`, `02_`...と2桁の連番で開始
- 各フォルダ内に`impl-guide.md`を配置
- フォルダ名はケバブケース（小文字+ハイフン）で簡潔に

### 実装プロンプトの必須構成要素

各`impl-guide.md`は以下のセクションを含める:

#### 1. 背景・目的

```markdown
## 背景・目的

現在の問題点と、この実装で達成したい目標を明確に記述。
技術的な文脈や、なぜこの変更が必要かを説明する。
```

#### 2. 修正対象ファイル

```markdown
## 修正対象ファイル

### 1. `src/path/to/file.ts`

**変更内容**: 何をどう変更するか

```typescript
// 変更前
const old = 'code';

// 変更後
const new = 'code';
```

**注意事項**:

- 特記すべき実装上の注意点
- 副作用や依存関係
```

ファイルごとに番号を振り、変更内容を具体的に記述。

#### 3. 実装手順

```markdown
## 実装手順

1. **Phase 1: タスク名**
   - 具体的なステップ
   - 実行するコマンド

2. **Phase 2: 次のタスク名**
   - ...
```

段階的な実装順序を明示。依存関係に注意。

#### 4. 検証手順

```markdown
## 検証手順

### 1. 型チェック

```bash
pnpm run type-check
```

### 2. 動作確認項目

- [ ] 確認項目1
- [ ] 確認項目2
```

実装後に必ず行うべきテストや確認事項をチェックリスト化。

#### 5. 期待される効果・注意事項

```markdown
## 期待される効果

1. **保守性向上**: 具体的にどう改善されるか
2. **パフォーマンス**: 期待される改善

## 注意事項

- 変更してはいけないもの
- 互換性に関する注意
- ロールバック方法
```

### 実装プロンプトを書くタイミング

以下の場合に実装プロンプトを作成:

- **複数ファイルにまたがる変更**が必要な場合
- **段階的な実装**が求められる場合（フェーズ分け）
- **スキーマ変更やマイグレーション**を伴う場合
- **アーキテクチャ変更**や**リファクタリング**の場合
- **他のエージェントや将来の自分**が参照する必要がある場合

**不要な場合**:

- 単一ファイルの軽微な修正
- バグ修正（1-2ファイル程度）
- UI調整のみの変更

### プロンプト内のコード例の書き方

```markdown
❌ 悪い例:

```typescript
// ...existing code...
const newFeature = true;
// ...existing code...
```

✅ 良い例:

```typescript
// 変更前: 3-5行のコンテキストを含める
export const oldFunction = () => {
  return 'old';
};

// 変更後: 同じく十分なコンテキスト
export const newFunction = () => {
  return 'new';
};
```

**重要**: `...existing code...`のようなプレースホルダーは使わない。実際のコードを記述する。

### 技術用語と表記統一

- **Drizzle生成型**: `typeof albums.$inferSelect`
- **UI層の拡張型**: `interface Album extends DbAlbum { ... }`
- **マイグレーション**: D1データベースのスキーマ変更
- **バインディング**: Cloudflare Workersの環境変数（`env.DB`, `env.R2`等）
- **Presigned URL**: R2への一時的なアップロード許可URL

### プロンプトのメンテナンス

- 実装完了後、プロンプトは**削除しない**（履歴として保持）
- 実装中に判明した追加の注意事項は、プロンプトに追記する
- 次の実装プロンプトを作成する際、過去のプロンプトを参考にする

### 例: 良い実装プロンプトの特徴

1. **具体性**: 「修正する」ではなく「`sharedWith`フィールドを`text`型から`userIds`配列に変更」
2. **完全性**: 必要な全てのファイル変更が列挙されている
3. **実行可能性**: コマンドやコード例がそのまま実行/コピペできる
4. **検証可能性**: 実装が正しいかを確認する手順が明確
5. **文脈提供**: なぜこの変更が必要かの背景説明がある

### 実装報告書（Implementation Report）

実装完了後、同じフォルダ内に**英語**で実装報告書を作成します。

```
./prompts/01_unify-drizzle-generated-types/
  ├── impl-guide.md
  └── impl-report.md  ← 実装完了後に追加
```

#### 報告書の必須構成要素（英語で記述）

```markdown
# Implementation Report: [Task Title]

## Summary
Brief overview of what was implemented (2-3 sentences).

## Changes Made

### Modified Files
- `path/to/file1.ts`: Description of changes
- `path/to/file2.tsx`: Description of changes

### New Files
- `path/to/new-file.ts`: Purpose and description

### Deleted Files
- `path/to/old-file.ts`: Reason for deletion

## Implementation Details

### Phase 1: [Phase Name]
- What was done
- Any deviations from the original plan

### Phase 2: [Phase Name]
- What was done
- Any deviations from the original plan

## Testing Results

### Type Check
```bash
pnpm run type-check
# Result: ✅ Pass / ❌ Fail (with details)
```

### Build
```bash
pnpm run build
# Result: ✅ Pass / ❌ Fail (with details)
```

### Manual Testing
- [ ] Test case 1: Description - ✅ Pass
- [ ] Test case 2: Description - ✅ Pass

## Issues Encountered

### Issue 1: [Title]
**Problem**: Description of the issue
**Solution**: How it was resolved
**Impact**: Any side effects or additional changes required

## Deviations from Plan

List any changes to the original implementation guide:
- Original plan: ...
- Actual implementation: ...
- Reason: ...

## Performance Impact

- Build time: Before vs After
- Type check time: Before vs After
- Runtime performance: Any notable changes

## Next Steps / Recommendations

- Suggested follow-up tasks
- Technical debt incurred
- Future improvements

## Completion Status

- [x] All planned features implemented
- [x] Tests passing
- [x] Documentation updated
- [ ] Any remaining tasks

**Implementation Date**: YYYY-MM-DD
**Implemented By**: [Agent/Developer Name]
```

#### 報告書作成のタイミング

- 実装完了後、**必ず**作成する
- テスト結果を全て含める
- 実装中に遭遇した問題と解決策を詳細に記録
- 将来の参考資料として機能させる
