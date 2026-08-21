# Native shell (`apps/native`)

WebView loads production origin by default (`https://album-app.maru-maru.workers.dev`), start path `/albums`. `WEB_APP_URL` extra may include `/albums`; `src/config.ts` strips it for API origin.

## Architecture
- UI is the web app. Native owns picker, queue, Wi-Fi constraint, notifications, token store, system-bar insets.
- Bridge: Web `sendToNative` (`window.ReactNativeWebView.postMessage` JSON). Native → Web: `injectJavaScript` dispatching `CustomEvent` names `native:*`.
- Web types: `src/lib/native-bridge.ts`. Keep Native `App.tsx` incoming union in sync.
- Session: `NativeSessionTokenSync` + auth-client `set-auth-token` header → SecureStore; upload service uses bearer.

## OAuth
- Google sign-in stays **inside** the WebView (https). Intercept `album://` / unknown-scheme errors (`oauth-navigation.ts`); do not treat as a fatal blank screen.

## Layout / identity
- Android edge-to-edge: padding in `AppShell` (`ANDROID_NAVIGATION_BAR_INSET`). Config plugin `plugins/with-android-system-bars.js`. Never patch generated `MainActivity.kt`.
- Colors: `APP_COLORS` in `src/constants/app-colors.ts`.
- iOS: `supportsTablet`, scheme `album`, bundle/package `com.r.t7maru.albumnative`.

## Build
- CNG: `ios/` `android/` gitignored. Custom native module ⇒ Expo Go unusable.
- Release artifacts only via `pnpm native:build:android|ios` → dated files under repo `build/`.
- After APK/IPA: uninstall old app before install if the JS bundle may be stale. If WebView hits production, web changes need `pnpm deploy:vinext` to take effect on device.

Upload queue and pending-cell contract: `mem:native/upload`
