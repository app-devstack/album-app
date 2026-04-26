/**
 * 動画ファイルから指定秒数のフレームをサムネイル画像として生成する
 */
export async function generateThumbnail(
  videoFile: File,
  seekTime: number = 1
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.addEventListener('loadeddata', () => {
      video.currentTime = seekTime; // 指定秒数のフレームを取得
    });

    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            URL.revokeObjectURL(video.src);
            resolve({ blob, dataUrl });
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.8
      );
    });

    video.addEventListener('error', () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Video loading failed'));
    });

    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
}
