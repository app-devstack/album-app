import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ANDROID_NAVIGATION_BAR_INSET } from '../constants/android-insets';
import { APP_COLORS } from '../constants/app-colors';

/** UploadChoiceSheet に渡すプロパティ。 */
export interface UploadChoiceSheetProps {
  visible: boolean;
  fileCount: number;
  onSendNow: () => void;
  onWaitForWifi: () => void;
  onCancel: () => void;
}

/** シートの内容領域の下余白（dp）。 */
const SHEET_CONTENT_PADDING_BOTTOM = 32;

/** シートの角丸半径（Web rounded-lg 相当）。 */
const SHEET_RADIUS = 8;

/** 「今すぐ送る」/「Wi-Fi まで待つ」を選ぶモーダルシート。 */
export function UploadChoiceSheet({
  visible,
  fileCount,
  onSendNow,
  onWaitForWifi,
  onCancel,
}: UploadChoiceSheetProps) {
  const SheetContainer = Platform.OS === 'ios' ? SafeAreaView : View;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <SheetContainer
          style={[
            styles.sheet,
            Platform.OS === 'android' && {
              paddingBottom:
                SHEET_CONTENT_PADDING_BOTTOM + ANDROID_NAVIGATION_BAR_INSET,
            },
          ]}
        >
          <Text style={styles.title}>アップロード方法</Text>
          <Text style={styles.subtitle}>
            {fileCount} 件のファイルを追加します
          </Text>

          <Pressable style={styles.primaryButton} onPress={onSendNow}>
            <Text style={styles.primaryButtonText}>今すぐ送る</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onWaitForWifi}>
            <Text style={styles.secondaryButtonText}>Wi-Fi まで待つ</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </Pressable>
        </SheetContainer>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: APP_COLORS.background,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: SHEET_CONTENT_PADDING_BOTTOM,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: APP_COLORS.mutedForeground,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: SHEET_RADIUS,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: APP_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: APP_COLORS.secondary,
    borderRadius: SHEET_RADIUS,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: APP_COLORS.secondaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: APP_COLORS.mutedForeground,
    fontSize: 15,
  },
});
