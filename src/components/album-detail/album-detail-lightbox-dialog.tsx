'use client';

import { VideoPlayer } from '@/components/common/video-player';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Photo } from '@/db/schema';
import { useRegenerateThumbnail } from '@/hooks/fetchers/use-photos';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Download,
  MoreHorizontal,
  RefreshCw,
  Loader2Icon as SpinnerIcon,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

/** Content-Disposition の filename を解釈し、無ければ fallback を返す。 */
function attachmentFilenameFromHeader(
  contentDisposition: string | null,
  fallback: string
): string {
  if (!contentDisposition) return fallback;
  const quoted = /filename="((?:[^"\\]|\\.)*)"/.exec(contentDisposition);
  if (quoted?.[1]) {
    return quoted[1].replace(/\\(.)/g, '$1');
  }
  return fallback;
}

/** アルバム詳細ライトボックスに渡すプロパティ。 */
export interface AlbumDetailLightboxDialogProps {
  item: Photo | null; // 表示する写真または動画
  onClose: () => void; // 閉じる（ブラウザ履歴と同期）
  onDelete: () => Promise<void>; // 確認後に実行する削除処理
  accentText: string; // useAccentStore 連動の ACCENT_COLORS.text（例: text-rose-500）
}

/** タップで開くフルスクリーンに近いメディアビューア。上部に戻る・ダウンロード・その他メニューを表示する。 */
export function AlbumDetailLightboxDialog({
  item,
  onClose,
  onDelete,
  accentText,
}: AlbumDetailLightboxDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const handleDownloadPhoto = async (size: 'full' | 'optimized') => {
    if (!item || item.mediaType !== 'image') return;

    const fallbackName = `${item.id}-${size}`;
    setIsDownloading(true);
    try {
      const res = await api.download.photo[':photoId'].$get({
        param: { photoId: item.id },
        query: { size },
      });

      if (!res.ok) {
        const description =
          res.status === 403
            ? 'ダウンロードする権限がありません'
            : res.status === 404
              ? '写真が見つかりません'
              : `ダウンロードに失敗しました (${res.status})`;
        toast({
          title: 'ダウンロードできませんでした',
          description,
          variant: 'destructive',
        });
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      try {
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = attachmentFilenameFromHeader(
          res.headers.get('Content-Disposition'),
          fallbackName
        );
        anchor.rel = 'noopener';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } finally {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
      }
    } catch {
      toast({
        title: 'ダウンロードできませんでした',
        description: 'ネットワークエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
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
            aria-label="戻る"
          >
            <ArrowLeft className="size-5" />
          </Button>

          <div className="flex items-center gap-1">
            {item.mediaType === 'image' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full text-foreground"
                    disabled={isDownloading}
                    aria-label="写真をダウンロード"
                  >
                    {isDownloading ? (
                      <SpinnerIcon className="size-5 animate-spin" />
                    ) : (
                      <Download className="size-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                  <DropdownMenuItem
                    onSelect={() => void handleDownloadPhoto('full')}
                    className="cursor-pointer py-3 text-base"
                  >
                    フルサイズ
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void handleDownloadPhoto('optimized')}
                    className="cursor-pointer py-3 text-base"
                  >
                    最適化済み
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full text-foreground"
                  aria-label="その他の操作"
                >
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[12rem]">
                {item.mediaType === 'video' && (
                  <DropdownMenuItem
                    onSelect={() => void handleRegenerateThumbnail()}
                    disabled={isRegenerating}
                    className="cursor-pointer py-3 text-base"
                  >
                    <RefreshCw
                      className={cn('size-4', isRegenerating && 'animate-spin')}
                    />
                    サムネイルを再生成
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => void handleDelete()}
                  disabled={isDeleting}
                  className="cursor-pointer py-3 text-base"
                >
                  <Trash2 className="size-4" />
                  削除する
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
