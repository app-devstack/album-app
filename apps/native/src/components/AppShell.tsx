import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

import { ANDROID_NAVIGATION_BAR_INSET } from '../constants/android-insets';

/** Android / iOS 共通のアプリ外枠に渡すプロパティ。 */
type AppShellProps = {
  children: ReactNode;
};

/**
 * アプリ全体の枠。iOS は SafeAreaView、Android だけシステムバー分の余白を付ける。
 */
export function AppShell({ children }: AppShellProps) {
  if (Platform.OS === 'ios') {
    return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
  }

  return <AndroidAppShell>{children}</AndroidAppShell>;
}

/** Android 専用。システムのライト／ダークに合わせて余白とステータスバーの文字色を揃える。 */
function AndroidAppShell({ children }: AppShellProps) {
  const isDark = useColorScheme() === 'dark';
  const top = Math.max(StatusBar.currentHeight ?? 0, 48);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? ANDROID_SHELL_DARK_BACKGROUND
            : ANDROID_SHELL_LIGHT_BACKGROUND,
          paddingTop: top,
          paddingBottom: ANDROID_NAVIGATION_BAR_INSET,
        },
      ]}
    >
      <ExpoStatusBar style="auto" />
      {children}
    </View>
  );
}

const ANDROID_SHELL_LIGHT_BACKGROUND = '#ffffff';
const ANDROID_SHELL_DARK_BACKGROUND = '#000000';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ANDROID_SHELL_LIGHT_BACKGROUND,
  },
});
