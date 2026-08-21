# D1 と Drizzle のセットアップから CRUD まで

Cloudflare D1（SQLite）を **Drizzle ORM** で扱う流れを、このリポジトリの構成に沿って整理する。

## 1. Wrangler で D1 をバインドする

`wrangler.jsonc` の `d1_databases` に `binding`（例: `DB`）、`database_name`、`database_id`、`migrations_dir` を指定する。マイグレーション SQL の出力先（例: `./drizzle/`）と一致させる。

ランタイムでは `cloudflare:workers` の `env.DB` が `D1Database` として渡る（本プロジェクトの `src/db/index.ts`）。

## 2. Drizzle の接続（アプリ側）

```ts
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

const db = drizzle(env.DB, { schema });
export default db;
```

- `schema` を渡すと **リレーション付きクエリ**（`db.query.*`）が使える。
- スキーマ定義は `src/db/schema.ts` のように `sqliteTable` でテーブルを宣言する。

## 3. Drizzle Kit（マイグレーション生成・D1 への適用）

### 設定（`drizzle.config.ts`）

- `dialect: 'sqlite'`
- `driver: 'd1-http'`（リモート D1 に HTTP で接続して生成・操作する場合）
- `schema` パスと `out`（マイグレーション出力ディレクトリ）を指定
- `dbCredentials` に Cloudflare の `accountId` / `databaseId` / `token`（`.env` を drizzle-kit 用に用意する場合が多い）

### 典型コマンド（`package.json` の例）

| スクリプト | 役割 |
|-----------|------|
| `pnpm db:generate` | スキーマ差分から `drizzle/` 以下に SQL を生成 |
| `pnpm db:migrate` | ローカル D1 にマイグレーション適用 |
| `pnpm db:migrate:remote` | リモート D1 に `--remote` で適用 |

スキーマ変更の流れは **schema 編集 → generate → migrate**。

## 4. CRUD の書き方（クエリ）

### Create

`db.insert(table).values({ ... }).run()`  
（D1 では `.run()` を付けるパターンが使われる）

### Read

- **単純な条件**: `db.select().from(table).where(eq(...))`
- **リレーション**: `db.query.<tableName>.findFirst({ where: ... })` など（schema に `relations` を定義している場合）

### Update

`db.update(table).set({ ... }).where(eq(table.id, id))`

### Delete

`db.delete(table).where(eq(table.id, id))`

### 補助

`and` / `or` / `eq` などは `drizzle-orm` からインポートする。

## 5. 型

テーブル定義から `typeof table.$inferSelect` / `typeof table.$inferInsert`（またはプロジェクトでエイリアスした `NewAlbum` など）で型を再利用する。

## 6. 注意点

- SQLite の制約（JSON カラムが無い場合は `text` + アプリ側で JSON 化など）をスキーマに反映する。
- **本番前**はリモート D1 へのマイグレーション適用と、`wrangler` / `cf-typegen` による型の更新を忘れない。

## 参照ファイル（このリポジトリ）

- `src/db/schema.ts` — テーブル定義
- `src/db/index.ts` — Drizzle インスタンス
- `drizzle.config.ts` — Drizzle Kit
- `wrangler.jsonc` — `d1_databases` / `migrations_dir`
- `src/app/api/[[...route]]/routes/albums.ts` — ルート内での insert/update/query の例
