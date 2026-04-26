'use client';

import { VideoPlayer } from '@/components/common/video-player';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Photo } from '@/db/schema';
import { useRegenerateThumbnail } from '@/hooks/fetchers/use-photos';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  RefreshCw,
  Loader2Icon as SpinnerIcon,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

/** アルバム詳細ライトボックスに渡すプロパティ。 */
export interface AlbumDetailLightboxDialogProps {
  item: Photo | null; // 表示する写真または動画
  onClose: () => void; // 閉じる
  onDelete: () => Promise<void>; // 確認後に実行する削除処理
  accentText: string; // useAccentStore 連動の ACCENT_COLORS.text（例: text-rose-500）
}

/** タップで開くフルスクリーンに近いメディアビューア。上部に戻る・削除を表示する。 */
export function AlbumDetailLightboxDialog({
  item,
  onClose,
  onDelete,
  accentText,
}: AlbumDetailLightboxDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { mutateAsync: regenerateThumbnail, isPending: isRegenerating } =
    useRegenerateThumbnail();

  useEffect(() => {
    setImageLoaded(false);
  }, [item?.id, item?.mediaType]);

  if (!item) return null;

  const handleDelete = async () => {
    if (!confirm('この写真を削除してもよろしいですか？')) return;
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegenerateThumbnail = async () => {
    if (!item || item.mediaType !== 'video') return;
    if (!confirm('サムネイルを再生成しますか？')) return;

    try {
      await regenerateThumbnail({
        photoId: item.id,
        albumId: item.albumId,
        videoUrl: item.url,
      });
    } catch (error) {
      console.error('Thumbnail regeneration failed:', error);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full max-w-none',
          'translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-none bg-background p-0 shadow-none',
          'sm:inset-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-4xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:shadow-lg'
        )}
      >
        <DialogTitle className="sr-only">メディアのプレビュー</DialogTitle>

        <div
          className={cn(
            'absolute inset-x-0 top-0 z-10 flex items-center justify-between',
            'px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2',
            'bg-background/90 backdrop-blur-sm sm:rounded-t-lg'
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full text-foreground"
            onClick={onClose}
            aria-label="閉じる"
          >
            <ArrowLeft className="size-5" />
          </Button>

          <div className="flex items-center gap-1">
            {item.mediaType === 'video' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full text-foreground"
                onClick={handleRegenerateThumbnail}
                disabled={isRegenerating}
                aria-label="サムネイルを再生成"
              >
                <RefreshCw
                  className={cn('size-5', isRegenerating && 'animate-spin')}
                />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full text-foreground"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="このメディアを削除"
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        </div>

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden pt-14 sm:pt-16"
          aria-busy={item.mediaType === 'image' ? !imageLoaded : undefined}
        >
          {item.mediaType === 'video' ? (
            <div className="flex h-full w-full max-h-full items-center justify-center px-2 pb-4 sm:px-4">
              <VideoPlayer
                src={item.url}
                poster={item.thumbnailUrl || undefined}
                duration={item.duration || undefined}
              />
            </div>
          ) : (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 top-14 flex items-center justify-center sm:top-16">
                  <SpinnerIcon
                    role="status"
                    className={cn('size-10 animate-spin', accentText)}
                    aria-label="画像を読み込み中"
                  />
                </div>
              )}
              <div className="contents sm:flex sm:min-h-0 sm:w-full sm:flex-1 sm:self-stretch sm:items-center sm:justify-center">
                <img
                  src={`/api/photos/${item.id}/optimized?mode=full`}
                  alt={item.alt}
                  className={cn(
                    'max-h-[calc(100dvh-5.5rem)] w-full object-contain transition-opacity duration-200',
                    'sm:max-h-full sm:max-w-full sm:h-auto sm:w-auto',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  crossOrigin="anonymous"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
