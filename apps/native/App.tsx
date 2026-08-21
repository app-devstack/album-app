import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import WebView, {
  type WebViewErrorEvent,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from 'react-native-webview';

import { setSessionToken } from './src/auth/token-store';
import { AppShell } from './src/components/AppShell';
import { UploadChoiceSheet } from './src/components/UploadChoiceSheet';
import { WEB_APP_START_URL } from './src/config';
import {
  isNonHttpNavigation,
  isUnknownSchemeError,
} from './src/oauth-navigation';
import { isWifiOrEthernet } from './src/upload/is-wifi-or-ethernet';
import {
  bootstrapUploadService,
  cancelQueuedUpload,
  dispatchPendingUploadsSnapshot,
  enqueueUpload,
  retryQueuedUpload,
  setUploadWebViewRef,
} from './src/upload/service';

/** Web から Native へ送るメッセージ。 */
type NativeIncomingMessage =
  | { type: 'OPEN_PICKER'; albumId: string; mediaType: 'image' | 'video' }
  | { type: 'SESSION_TOKEN'; token: string }
  | { type: 'GET_PENDING_UPLOADS'; albumId: string }
  | { type: 'GET_NETWORK_STATE' }
  | { type: 'RETRY_PENDING_UPLOAD'; id: string }
  | { type: 'CANCEL_PENDING_UPLOAD'; id: string };

/** ピッカー選択後に送る待機中アセット。 */
type PendingAsset = {
  uri: string;
  filename: string;
  contentType: string;
  mediaType: 'image' | 'video';
  duration?: number;
};

/** WebView シェル本体。 */
export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [webUri, setWebUri] = useState(WEB_APP_START_URL);
  const [choiceVisible, setChoiceVisible] = useState(false);
  const [pendingAlbumId, setPendingAlbumId] = useState<string | null>(null);
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);

  useEffect(() => {
    void Notifications.requestPermissionsAsync();
    void bootstrapUploadService();
    return () => setUploadWebViewRef(null);
  }, []);

  const handleWebViewLoadEnd = useCallback(() => {
    setUploadWebViewRef(webViewRef.current);
  }, []);

  const processUpload = useCallback(
    async (
      albumId: string,
      assets: PendingAsset[],
      wifiOnly: boolean
    ) => {
      if (assets.length === 0) {
        return;
      }

      for (const asset of assets) {
        try {
          await enqueueUpload({
            albumId,
            uri: asset.uri,
            filename: asset.filename,
            contentType: asset.contentType,
            mediaType: asset.mediaType,
            wifiOnly,
            duration: asset.duration,
          });
        } catch (error) {
          Alert.alert(
            'アップロード開始に失敗しました',
            error instanceof Error ? error.message : '不明なエラー'
          );
        }
      }
    },
    []
  );

  const launchPicker = useCallback(
    async (albumId: string, mediaType: 'image' | 'video') => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          '写真ライブラリへのアクセス',
          '設定から写真へのアクセスを許可してください。'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          mediaType === 'video'
            ? ['videos']
            : ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const assets: PendingAsset[] = result.assets.map((asset, index) => {
        const fallbackName =
          mediaType === 'video' ? `video-${index + 1}.mp4` : `photo-${index + 1}.jpg`;
        const filename = asset.fileName ?? fallbackName;
        const contentType =
          mediaType === 'video'
            ? asset.mimeType ?? 'video/mp4'
            : asset.mimeType ?? 'image/jpeg';

        return {
          uri: asset.uri,
          filename,
          contentType,
          mediaType,
          duration:
            mediaType === 'video' && asset.duration != null
              ? Math.round(asset.duration / 1000)
              : undefined,
        };
      });

      const onWifi = await isWifiOrEthernet();
      if (onWifi) {
        void processUpload(albumId, assets, false);
        return;
      }

      setPendingAlbumId(albumId);
      setPendingAssets(assets);
      setChoiceVisible(true);
    },
    [processUpload]
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message: NativeIncomingMessage;
      try {
        message = JSON.parse(event.nativeEvent.data) as NativeIncomingMessage;
      } catch {
        return;
      }

      if (message.type === 'SESSION_TOKEN') {
        void setSessionToken(message.token);
        return;
      }

      if (message.type === 'OPEN_PICKER') {
        void launchPicker(message.albumId, message.mediaType);
        return;
      }

      if (message.type === 'GET_PENDING_UPLOADS') {
        void dispatchPendingUploadsSnapshot(message.albumId);
        return;
      }

      if (message.type === 'GET_NETWORK_STATE') {
        void (async () => {
          const onWifi = await isWifiOrEthernet();
          webViewRef.current?.injectJavaScript(
            `window.dispatchEvent(new CustomEvent('native:networkState', { detail: ${JSON.stringify({ onWifi })} })); true;`
          );
        })();
        return;
      }

      if (message.type === 'RETRY_PENDING_UPLOAD') {
        void retryQueuedUpload(message.id);
        return;
      }

      if (message.type === 'CANCEL_PENDING_UPLOAD') {
        void cancelQueuedUpload(message.id);
      }
    },
    [launchPicker]
  );

  const loadAppHome = useCallback(() => {
    setWebUri(`${WEB_APP_START_URL}#native-oauth-${Date.now()}`);
  }, []);

  const handleShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation) => {
      if (!isNonHttpNavigation(request.url)) {
        return true;
      }
      loadAppHome();
      return false;
    },
    [loadAppHome]
  );

  const handleWebViewError = useCallback(
    (event: WebViewErrorEvent) => {
      if (!isUnknownSchemeError(event.nativeEvent)) {
        return;
      }
      loadAppHome();
    },
    [loadAppHome]
  );

  const resetPending = useCallback(() => {
    setChoiceVisible(false);
    setPendingAlbumId(null);
    setPendingAssets([]);
  }, []);

  return (
    <AppShell>
      <WebView
        ref={webViewRef}
        source={{ uri: webUri }}
        userAgent={WEBVIEW_USER_AGENT}
        originWhitelist={['http://*', 'https://*']}
        setSupportMultipleWindows={false}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onError={handleWebViewError}
        onLoadEnd={handleWebViewLoadEnd}
        style={styles.webview}
      />

      <UploadChoiceSheet
        visible={choiceVisible}
        fileCount={pendingAssets.length}
        onSendNow={() => {
          const albumId = pendingAlbumId;
          const assets = pendingAssets;
          resetPending();
          if (!albumId) {
            return;
          }
          void processUpload(albumId, assets, false);
        }}
        onWaitForWifi={() => {
          const albumId = pendingAlbumId;
          const assets = pendingAssets;
          resetPending();
          if (!albumId) {
            return;
          }
          void processUpload(albumId, assets, true);
        }}
        onCancel={resetPending}
      />
    </AppShell>
  );
}

/** Google OAuth を WebView 内で完了させるため、Safari / Chrome 相当の UA を使う。 */
const WEBVIEW_USER_AGENT = Platform.select({
  ios: 'Mozilla/5.0 (iPad; CPU OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
});

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
