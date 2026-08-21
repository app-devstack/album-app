#!/usr/bin/env bash
# Release APK を build/android/album-{YYYY_mm_DD_HHMM}.apk にコピーする。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NATIVE_DIR="$ROOT/apps/native"
OUT_DIR="$ROOT/build/android"
STAMP="$(date +%Y_%m_%d_%H%M)"
DEST="$OUT_DIR/album-${STAMP}.apk"
SRC="$NATIVE_DIR/android/app/build/outputs/apk/release/app-release.apk"

mkdir -p "$OUT_DIR"
cd "$NATIVE_DIR"

if [[ ! -d android ]]; then
  pnpm exec expo prebuild --platform android --non-interactive
fi

cd android
./gradlew assembleRelease

if [[ ! -f "$SRC" ]]; then
  echo "error: APK が見つかりません: $SRC" >&2
  exit 1
fi

cp "$SRC" "$DEST"
echo "Wrote $DEST"
