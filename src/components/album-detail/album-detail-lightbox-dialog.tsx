'use client';

import { VideoPlayer } from '@/components/layout/video-player';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Photo } from '@/db/schema';
import { cn } from '@/lib/utils';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';

/** アルバム詳細ライトボックスに渡すプロパティ。 */
export interface AlbumDetailLightboxDialogProps {
  item: Photo | null; // 表示する写真または動画
  onClose: () => void; // 閉じる
  onDelete: () => Promise<void>; // 確認後に実行する削除処理
}

/** タップで開くフルスクリーンに近いメディアビューア。上部に戻る・削除を表示する。 */
export function AlbumDetailLightboxDialog({
  item,
  onClose,
  onDelete,
}: AlbumDetailLightboxDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full text-foreground"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            aria-label="このメディアを削除"
          >
            <Trash2 className="size-5" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden pt-14 sm:pt-16">
          {item.mediaType === 'video' ? (
            <div className="flex h-full w-full max-h-full items-center justify-center px-2 pb-4 sm:px-4">
              <VideoPlayer src={item.url} />
            </div>
          ) : (
            <img
              src={`/api/photos/${item.id}/optimized?mode=full`}
              alt={item.alt}
              className="max-h-[calc(100dvh-5.5rem)] w-full object-contain sm:max-h-[min(80vh,calc(100%-5rem))]"
              crossOrigin="anonymous"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
