import { CircleAlert, CloudUpload } from 'lucide-react';
import { cn } from '@/lib/utils';

/** AlbumDetailPendingPhotoCell に渡すプロパティ。 */
export interface AlbumDetailPendingPhotoCellProps {
  previewDataUrl: string;
  mediaType: 'image' | 'video';
  status: 'pending' | 'failed';
  onPress?: () => void; // タップ時。親で再送／取り消しダイアログを開く
}

/** Wi-Fi 待ち／失敗のプレビューセル。タップで操作できる。 */
export function AlbumDetailPendingPhotoCell({
  previewDataUrl,
  mediaType,
  status,
  onPress,
}: AlbumDetailPendingPhotoCellProps) {
  const isFailed = status === 'failed';
  const label =
    mediaType === 'video'
      ? isFailed
        ? '送信に失敗した動画。タップして再送または取り消し'
        : '送信待ちの動画。タップして再送または取り消し'
      : isFailed
        ? '送信に失敗した画像。タップして再送または取り消し'
        : '送信待ちの画像。タップして再送または取り消し';

  return (
    <div
      className="relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-muted"
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onPress}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPress?.();
        }
      }}
    >
      <img
        src={previewDataUrl}
        alt=""
        className={cn(
          'h-full w-full object-cover',
          isFailed ? 'opacity-70' : undefined
        )}
      />
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          isFailed ? 'bg-black/50' : 'bg-black/40'
        )}
      >
        {isFailed ? (
          <CircleAlert
            size={40}
            strokeWidth={1.5}
            className="text-white/90 drop-shadow-lg"
          />
        ) : (
          <CloudUpload
            size={40}
            strokeWidth={1.5}
            className="text-white/90 drop-shadow-lg"
          />
        )}
      </div>
    </div>
  );
}
