# Expo ネイティブアプリの成果物ビルド

リリース APK / IPA は **必ず** 次のスクリプトで作る。成果物はリポジトリ直下の `build/` に日時付きでコピーされる。

```bash
pnpm native:build:android
# -> build/android/album-{YYYY_mm_DD_HHMM}.apk

pnpm native:build:ios
# -> build/ios/album-{YYYY_mm_DD_HHMM}.ipa
```

`gradlew` や `xcodebuild` を直接叩いて中間成果物を渡さない。

---

以下はスクリプトが内部で使う手順のメモ。エミュレータや実機へのインストール、Metro 起動は対象外。

作業ディレクトリは常に `apps/native`。カスタムネイティブモジュールがあるため Expo Go 向けの出力は使わない。`app.config.ts` の `ios.bundleIdentifier` と `android.package`（現行は `com.r.t7maru.albumnative`）が無いと `prebuild` は失敗する。

`ios/` と `android/` が無い初回は、各プラットフォームの `prebuild` が必要。2 回目以降、ネイティブ設定を変えていなければ `prebuild` は省略できる。

---

## Android（APK / AAB）

```bash
cd apps/native
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
./gradlew bundleRelease
```

| 成果物 | パス |
|--------|------|
| APK | `apps/native/android/app/build/outputs/apk/release/app-release.apk` |
| AAB | `apps/native/android/app/build/outputs/bundle/release/app-release.aab` |

Release 用 keystore が未設定だと `assembleRelease` / `bundleRelease` は失敗する。

---

## iOS（IPA）

`ExportOptions.plist` は `prebuild` では作られない。`exportArchive` の前に `apps/native/ios/ExportOptions.plist` を置き、Apple の証明書とプロビジョニングプロファイルで署名できる状態にする。

```bash
cd apps/native
npx expo prebuild --platform ios
xcodebuild \
  -workspace ios/Album.xcworkspace \
  -scheme Album \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$PWD/build/Album.xcarchive" \
  archive
xcodebuild \
  -exportArchive \
  -archivePath "$PWD/build/Album.xcarchive" \
  -exportPath "$PWD/build/ipa" \
  -exportOptionsPlist ios/ExportOptions.plist
```

| 成果物 | パス |
|--------|------|
| アーカイブ | `apps/native/build/Album.xcarchive` |
| IPA | `apps/native/build/ipa/` 配下 |

署名または `ExportOptions.plist` が無いと `exportArchive` は失敗する。
