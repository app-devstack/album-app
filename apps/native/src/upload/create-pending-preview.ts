import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image } from 'react-native';

const MAX_LONG_EDGE = 400;

/** 画像 URI の幅と高さを取得する。 */
function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      reject
    );
  });
}

/** プレビュー用のソース URI と削除対象一時ファイルを解決する。 */
async function resolvePreviewSource(
  filePath: string,
  mediaType: 'image' | 'video'
): Promise<{ sourceUri: string; tempPaths: string[] }> {
  if (mediaType === 'image') {
    return { sourceUri: filePath, tempPaths: [] };
  }

  const thumbnail = await VideoThumbnails.getThumbnailAsync(filePath, {
    time: 0,
  });

  return { sourceUri: thumbnail.uri, tempPaths: [thumbnail.uri] };
}

/** 長辺 400px 以内になるようリサイズアクションを組み立てる。 */
function buildResizeAction(
  width: number,
  height: number
): { resize: { width?: number; height?: number } } | null {
  const longEdge = Math.max(width, height);

  if (longEdge <= MAX_LONG_EDGE) {
    return null;
  }

  if (width >= height) {
    return { resize: { width: MAX_LONG_EDGE } };
  }

  return { resize: { height: MAX_LONG_EDGE } };
}

/** キュー項目用の JPEG プレビュー data URL を生成する。 */
export async function createPendingPreview(
  filePath: string,
  mediaType: 'image' | 'video'
): Promise<string | null> {
  const tempPaths: string[] = [];

  try {
    const { sourceUri, tempPaths: thumbnailPaths } = await resolvePreviewSource(
      filePath,
      mediaType
    );
    tempPaths.push(...thumbnailPaths);

    const { width, height } = await getImageSize(sourceUri);
    const resizeAction = buildResizeAction(width, height);
    const actions = resizeAction ? [resizeAction] : [];

    const result = await manipulateAsync(sourceUri, actions, {
      compress: 0.8,
      format: SaveFormat.JPEG,
      base64: true,
    });

    if (result.uri !== sourceUri && result.uri !== filePath) {
      tempPaths.push(result.uri);
    }

    if (!result.base64) {
      return null;
    }

    return `data:image/jpeg;base64,${result.base64}`;
  } catch {
    return null;
  } finally {
    for (const path of tempPaths) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }
  }
}
