#!/usr/bin/env sh

# Upload secrets to Cloudflare Workers
# This script checks if secrets.json exists before uploading

set -e

SECRETS_FILE=".secrets.json"

# Check if secrets.json exists
if [ ! -f "$SECRETS_FILE" ]; then
  echo "❌ エラー: $SECRETS_FILE が見つかりません"
  echo ""
  echo "プロジェクトルートに以下の形式で $SECRETS_FILE を作成してください:"
  echo "{"
  echo "  \"YOUR_SECRET_TOKEN\": \"your_secret_token\","
  echo "}"
  echo ""
  exit 1
fi

# Upload secrets
wrangler secret bulk "$SECRETS_FILE"

echo ""
echo "✅ シークレットのアップロードが完了しました"
