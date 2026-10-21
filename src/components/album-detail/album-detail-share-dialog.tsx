'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  mediaShareUrl,
  useCreateMediaShare,
  usePhotoShare,
} from '@/hooks/fetchers/use-media-shares';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

/** ライトボックスの限定公開ダイアログに渡すプロパティ。 */
export interface AlbumDetailShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoId: string;
  mediaType: 'image' | 'video';
}

/**
 * 1件の限定公開URLを発行し、コピーする。
 * @description 公開中は同じURLを何度でもコピーできる。オフは設定の公開一覧で行う。
 */
export function AlbumDetailShareDialog({
  open,
  onOpenChange,
  photoId,
  mediaType,
}: AlbumDetailShareDialogProps) {
  const shareQuery = usePhotoShare(photoId, open);
  const createShare = useCreateMediaShare();
  const [copied, setCopied] = useState(false);
  const label = mediaType === 'video' ? '動画' : '写真';
  const token = shareQuery.data?.token ?? null;
  const url = token ? mediaShareUrl(token) : '';

  useEffect(() => {
    if (open) setCopied(false);
  }, [open, photoId]);

  const copyUrl = async (nextUrl: string) => {
    try {
      await navigator.clipboard.writeText(nextUrl);
      setCopied(true);
      toast({ title: 'リンクをコピーしました' });
    } catch {
      toast({
        title: 'コピーできませんでした',
        description: 'リンクを長押ししてコピーしてください',
        variant: 'destructive',
      });
    }
  };

  const publish = async () => {
    try {
      const nextToken = await createShare.mutateAsync(photoId);
      await copyUrl(mediaShareUrl(nextToken));
    } catch {
      toast({
        title: '公開リンクを発行できませんでした',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>限定公開リンク</DialogTitle>
          <DialogDescription className="text-left leading-relaxed">
            リンクを知っている人だけが、この{label}をログインなしで見られます。
          </DialogDescription>
        </DialogHeader>

        {shareQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : shareQuery.isError ? (
          <p className="text-sm text-muted-foreground">
            公開状態を読み込めませんでした。
          </p>
        ) : token ? (
          <input
            readOnly
            value={url}
            aria-label="限定公開リンク"
            className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm"
            onFocus={(event) => event.currentTarget.select()}
          />
        ) : (
          <p className="text-sm text-muted-foreground">まだ公開していません。</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="dialog"
            onClick={() => onOpenChange(false)}
          >
            閉じる
          </Button>
          {token ? (
            <Button
              type="button"
              size="dialog"
              onClick={() => void copyUrl(url)}
            >
              {copied ? 'コピーしました' : 'コピーする'}
            </Button>
          ) : shareQuery.isError ? null : (
            <Button
              type="button"
              size="dialog"
              disabled={shareQuery.isLoading || createShare.isPending}
              onClick={() => void publish()}
            >
              公開してコピーする
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
