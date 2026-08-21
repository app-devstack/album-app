#!/usr/bin/env bash
# Release IPA を build/ios/album-{YYYY_mm_DD_HHMM}.ipa にコピーする。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NATIVE_DIR="$ROOT/apps/native"
OUT_DIR="$ROOT/build/ios"
STAMP="$(date +%Y_%m_%d_%H%M)"
DEST="$OUT_DIR/album-${STAMP}.ipa"
ARCHIVE_PATH="$NATIVE_DIR/build/Album.xcarchive"
EXPORT_PATH="$NATIVE_DIR/build/ipa"
EXPORT_OPTIONS="$NATIVE_DIR/ios/ExportOptions.plist"

mkdir -p "$OUT_DIR"
cd "$NATIVE_DIR"

if [[ ! -d ios ]]; then
  pnpm exec expo prebuild --platform ios --non-interactive
fi

if [[ ! -f "$EXPORT_OPTIONS" ]]; then
  echo "error: $EXPORT_OPTIONS がありません" >&2
  exit 1
fi

xcodebuild \
  -workspace ios/Album.xcworkspace \
  -scheme Album \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  archive

xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS"

IPA_SRC="$(find "$EXPORT_PATH" -maxdepth 1 -name '*.ipa' | head -n 1)"
if [[ -z "$IPA_SRC" || ! -f "$IPA_SRC" ]]; then
  echo "error: IPA が見つかりません: $EXPORT_PATH" >&2
  exit 1
fi

cp "$IPA_SRC" "$DEST"
echo "Wrote $DEST"
