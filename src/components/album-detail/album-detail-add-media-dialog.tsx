'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type AccentColorConfig } from '@/lib/data';
import { isNative } from '@/lib/native-bridge';
import { cn } from '@/lib/utils';
import { Film, ImagePlus } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

/** メディア追加ダイアログに渡すプロパティ。 */
export interface AlbumDetailAddMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUploadInProgress: boolean;
  accentConfig: AccentColorConfig;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNativePick?: (mediaType: 'image' | 'video') => void; // Native ラッパー内では file input の代わりに呼ぶ
}

/**
 * 写真・動画を破線ドロップゾーンから追加するダイアログ。
 * @description 非表示の file input とラベルを連携させ、キーボード操作でも選べるようにする。
 */
export function AlbumDetailAddMediaDialog({
  open,
  onOpenChange,
  mediaUploadInProgress,
  accentConfig,
  onImageChange,
  onVideoChange,
  onNativePick,
}: AlbumDetailAddMediaDialogProps) {
  const imageInputId = useId();
  const videoInputId = useId();
  const busy = mediaUploadInProgress;
  const [nativeReady, setNativeReady] = useState(false);

  useEffect(() => {
    setNativeReady(isNative());
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        onPointerDownOutside={(ev) => busy && ev.preventDefault()}
        onEscapeKeyDown={(ev) => busy && ev.preventDefault()}
        onInteractOutside={(ev) => busy && ev.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>メディアを追加</DialogTitle>
          <DialogDescription className="text-left leading-relaxed">
            下の枠内をタップしてファイルを選びます。写真と動画は、それぞれ別の操作になります。
          </DialogDescription>
        </DialogHeader>

        {busy ? (
          <p
            className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-2.5"
            role="status"
            aria-live="polite"
          >
            アップロード処理中です。完了までしばらくお待ちください。
          </p>
        ) : null}

        <div
          className={cn(
            'grid grid-cols-2 gap-3 sm:gap-4',
            busy && 'pointer-events-none opacity-60'
          )}
          aria-busy={busy}
        >
          <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              写真
            </span>
            <label
              {...(nativeReady
                ? {
                    onClick: (e: React.MouseEvent<HTMLLabelElement>) => {
                      e.preventDefault();
                      if (!busy) onNativePick?.('image');
                    },
                  }
                : { htmlFor: imageInputId })}
              className={cn(
                'group relative flex min-h-[118px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-2 py-4 text-center transition-[border-color,background-color,box-shadow] sm:min-h-[140px] sm:gap-2 sm:px-4 sm:py-6',
                'hover:border-muted-foreground/45 hover:bg-muted/35',
                'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background',
                accentConfig.ring,
                !busy && 'active:scale-[0.99]'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-sm ring-1 ring-border/60',
                  accentConfig.text
                )}
                aria-hidden
              >
                <ImagePlus className="size-5" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-medium text-foreground sm:text-sm">
                写真を選ぶ
              </span>
              <span className="text-[10px] text-muted-foreground leading-snug sm:text-xs">
                JPEG / PNG / WebP など
                <br />
                <span className="text-muted-foreground/80">複数選択可</span>
              </span>
            </label>
            {!nativeReady ? (
              <input
                id={imageInputId}
                type="file"
                accept="image/*"
                multiple
                disabled={busy}
                onChange={onImageChange}
                className="sr-only"
              />
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              動画
            </span>
            <label
              {...(nativeReady
                ? {
                    onClick: (e: React.MouseEvent<HTMLLabelElement>) => {
                      e.preventDefault();
                      if (!busy) onNativePick?.('video');
                    },
                  }
                : { htmlFor: videoInputId })}
              className={cn(
                'group relative flex min-h-[118px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-2 py-4 text-center transition-[border-color,background-color,box-shadow] sm:min-h-[140px] sm:gap-2 sm:px-4 sm:py-6',
                'hover:border-muted-foreground/45 hover:bg-muted/35',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
                !busy && 'active:scale-[0.99]'
              )}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm ring-1 ring-border/60"
                aria-hidden
              >
                <Film className="size-5" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-medium text-foreground sm:text-sm">
                動画を選ぶ
              </span>
              <span className="text-[10px] text-muted-foreground leading-snug sm:text-xs">
                MP4 / MOV など
                <br />
                <span className="text-muted-foreground/80">複数選択可</span>
              </span>
            </label>
            {!nativeReady ? (
              <input
                id={videoInputId}
                type="file"
                accept="video/*"
                multiple
                disabled={busy}
                onChange={onVideoChange}
                className="sr-only"
              />
            ) : null}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          スマートフォンでは、カメラで撮影したメディアもここから選べます。容量の大きい動画は
          Wi-Fi 環境での追加をおすすめします。
        </p>
      </DialogContent>
    </Dialog>
  );
}
