# Hono による API の書き方

このリポジトリでは **Hono** を Next.js の Route Handler（`src/app/api/[[...route]]/route.ts`）からマウントし、リソースごとに `routes/*.ts` を分割している。別アプリでも同様に使う際の要点をまとめる。

## 1. アプリの共通型とファクトリ

`createApp()` で `Bindings`（Cloudflare の `DB` / `R2` など）を型パラメータに載せた `Hono` を返す（`src/lib/api.ts`）。

- フロントから型安全に呼ぶために `hc`（`hono/client`）でクライアントを生成し、`AppType` をルート定義から `typeof route` で取得する。

## 2. エントリのマウント

- `basePath('/api')` でプレフィックスを付ける。
- `.route('/albums', albumsRouter)` のように **サブルーターを合成**する。
- Next.js では `hono/vercel` の `handle` を `GET` / `POST` / `PUT` / `DELETE` / `PATCH` に export する。

## 3. ルーター分割（リソースごと）

各ファイルで `createApp()` したルーターを `export const xxxRouter` として公開し、エントリでまとめる。REST 的に `.get` / `.post` / `.put` / `.delete` をチェーンする。

## 4. 入力検証

`@hono/zod-validator` の `zValidator('json', schema)` で JSON ボディを Zod で検証する。ハンドラ内では `c.req.valid('json')` で型付きの値を取得する。

パスパラメータは `c.req.param('id')`、クエリは `c.req.query('groupId')`。

## 5. レスポンス

- `c.json(data)` / `c.json(data, status)`
- 認可・エラーは `401` / `403` / `404` など適切なステータスで返す。

## 6. ミドルウェア

`.use(async (c, next) => { ... await next(); })` でロギングや共通処理を挟める。セッション取得などは `c.req.raw.headers` を既存の認証ヘルパに渡すパターン（本プロジェクトの `getSession`）など。

## 7. 最小パターン（概念）

```ts
const router = createApp();

export const itemsRouter = router
  .get('/', async (c) => {
    return c.json({ items: [] });
  })
  .post('/', zValidator('json', createSchema), async (c) => {
    const body = c.req.valid('json');
    return c.json({ created: body }, 201);
  });
```

## 参照ファイル（このリポジトリ）

- `src/lib/api.ts` — `createApp` / `Bindings` / `api` クライアント
- `src/app/api/[[...route]]/route.ts` — ルート合成と `handle` の export
- `src/app/api/[[...route]]/routes/albums.ts` — `zValidator` + DB 操作の例
