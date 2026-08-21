import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Album',
  slug: 'album-native',
  scheme: 'album',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  plugins: [...(config.plugins ?? []), './plugins/with-android-system-bars'],
  extra: {
    webAppUrl:
      process.env.WEB_APP_URL ?? 'https://album-app.maru-maru.workers.dev',
  },
  ios: {
    bundleIdentifier: 'com.r.t7maru.albumnative',
    supportsTablet: true,
    icon: './assets/icon.png',
    infoPlist: {
      UIBackgroundModes: ['fetch'],
    },
  },
  android: {
    package: 'com.r.t7maru.albumnative',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundColor: '#FFEDF4',
    },
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'POST_NOTIFICATIONS',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_DATA_SYNC',
    ],
  },
});
