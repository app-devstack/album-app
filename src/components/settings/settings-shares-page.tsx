'use client';

import { SettingsSubpageShell } from '@/components/settings/settings-subpage-shell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loading } from '@/components/ui/loading';
import {
  useMediaShares,
  useRevokeMediaShare,
  type MediaShareSummary,
} from '@/hooks/fetchers/use-media-shares';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

/** 設定の公開一覧。オフにするとそのリンクは二度と開けない。 */
export function SettingsSharesPage() {
  const sharesQuery = useMediaShares();
  const revokeShare = useRevokeMediaShare();
  const [pending, setPending] = useState<MediaShareSummary | null>(null);

  const confirmOff = async () => {
    if (!pending) return;
    try {
      await revokeShare.mutateAsync(pending.photoId);
      setPending(null);
      toast({ title: '公開をオフにしました' });
    } catch {
      toast({
        title: '公開をオフにできませんでした',
        variant: 'destructive',
      });
    }
  };

  return (
    <SettingsSubpageShell title="公開一覧">
      {sharesQuery.isLoading ? (
        <Loading variant="section" message="公開一覧を読み込み中..." />
      ) : sharesQuery.isError || !sharesQuery.data ? (
        <p className="text-sm text-muted-foreground">
          公開一覧を読み込めませんでした。
        </p>
      ) : sharesQuery.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          公開中の写真・動画はありません。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sharesQuery.data.map((share) => (
            <li
              key={share.photoId}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <img
                src={
                  share.mediaType === 'video'
                    ? `/api/photos/${share.photoId}/video-thumbnail`
                    : `/api/photos/${share.photoId}/optimized?mode=thumb`
                }
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover bg-muted"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {share.mediaType === 'video' ? '動画' : '写真'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {share.albumTitle}
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setPending(share)}
              >
                オフにする
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !revokeShare.isPending) setPending(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>公開をオフにしますか？</DialogTitle>
            <DialogDescription className="text-left leading-relaxed">
              このリンクは二度と開けなくなります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="dialog"
              disabled={revokeShare.isPending}
              onClick={() => setPending(null)}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="dialog"
              disabled={revokeShare.isPending}
              onClick={() => void confirmOff()}
            >
              公開をオフにする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSubpageShell>
  );
}
