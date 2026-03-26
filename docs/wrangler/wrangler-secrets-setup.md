# Wrangler Secrets 一括登録ガイド

このドキュメントでは、Cloudflare Workersのシークレット（環境変数）を一括で登録する手順を説明します。

## 前提条件

- Wrangler CLI がインストール済み
- Cloudflareアカウントにログイン済み（`wrangler login`）
- 必要な認証情報（R2 Access Key、Secret Access Keyなど）を取得済み

## 手順

### 1. シークレット用JSONファイルの作成

プロジェクトルートに`secrets.json`を作成します:

```json
{
  "R2_ACCESS_KEY_ID": "your_access_key_id_here",
  "R2_SECRET_ACCESS_KEY": "your_secret_access_key_here",
  "CLOUDFLARE_ACCOUNT_ID": "your_account_id_here",
  "CLOUDFLARE_DATABASE_ID": "your_database_id_here",
  "CLOUDFLARE_D1_TOKEN": "your_d1_token_here",
  "R2_BUCKET_NAME": "album-app-media"
}
```

**重要**: このファイルには機密情報が含まれるため、必ず`.gitignore`に追加してください。

### 2. `.gitignore`への追加

`.gitignore`に以下を追加（既に追加されている場合はスキップ）:

```gitignore
# Secrets
secrets.json
```

### 3. 一括登録の実行

以下のコマンドでシークレットを一括登録します:

```bash
wrangler secret bulk secrets.json
```

**実行結果の例**:

```
🌀 Creating the secrets for the Worker "album-app"
✨ Successfully created secret for key: R2_ACCESS_KEY_ID
✨ Successfully created secret for key: R2_SECRET_ACCESS_KEY
✨ Successfully created secret for key: CLOUDFLARE_ACCOUNT_ID
✨ Successfully created secret for key: CLOUDFLARE_DATABASE_ID
✨ Successfully created secret for key: CLOUDFLARE_D1_TOKEN
✨ Successfully created secret for key: R2_BUCKET_NAME
✅ Success! Uploaded 6 secrets
```

### 4. 登録確認

登録されたシークレットを確認するには:

```bash
wrangler secret list
```

## 注意事項

### `.dev.vars`との違い

- **`.dev.vars`**: ローカル開発用（`KEY=VALUE`形式）
- **`secrets.json`**: 本番環境用（JSON形式）

`.dev.vars`の内容をそのまま`wrangler secret bulk`では使用できません。形式が異なるためです。

### 変換スクリプト（オプション）

もし`.dev.vars`から`secrets.json`を生成したい場合:

```bash
# .dev.vars → secrets.json 変換スクリプト
awk -F= '{printf "\"%s\": \"%s\",\n", $1, $2}' .dev.vars | \
  sed '1i{' | \
  sed '$s/,$/\n}/' > secrets.json
```

**注意**: 上記スクリプトは簡易的なもので、複雑な値（改行、特殊文字など）には対応していません。手動での確認・修正を推奨します。

## セキュリティベストプラクティス

1. **`secrets.json`は絶対にコミットしない**
   - `.gitignore`に必ず追加
   - チーム共有はセキュアな方法（1Password、Vaultなど）を使用

2. **定期的なローテーション**
   - R2のアクセスキーなどは定期的に更新
   - 更新後は`wrangler secret bulk secrets.json`で再登録

3. **最小権限の原則**
   - 各シークレットには必要最小限の権限のみ付与

4. **削除方法**
   - 不要になったシークレットは削除: `wrangler secret delete <KEY_NAME>`

## トラブルシューティング

### エラー: `Worker not found`

`wrangler.jsonc`の`name`フィールドが正しく設定されているか確認してください。

### エラー: `Invalid JSON format`

`secrets.json`の構文エラーを確認してください。最後の要素にカンマが付いていないか、閉じ括弧が正しいかなど。

### シークレットが反映されない

デプロイ後、シークレットが反映されるまで数分かかることがあります。`wrangler deploy`を再実行してみてください。

## 関連ドキュメント

- [Wrangler Secrets 公式ドキュメント](https://developers.cloudflare.com/workers/wrangler/commands/#secret)
- [Cloudflare Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
