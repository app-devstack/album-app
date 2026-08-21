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

/** 送信待ちの再送・取消ダイアログの表示モード。 */
export type PendingUploadRetryDialogMode = 'failed' | 'pending-retry';

/** 送信待ちの再送・取消ダイアログに渡すプロパティ。 */
export interface AlbumDetailPendingUploadRetryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PendingUploadRetryDialogMode;
  onCancelPending: () => void; // 送信待ちの取消確認へ進む
  onRetry: () => void; // 今すぐ再送する
}

/**
 * 送信待ち／送信失敗時に再送または取消を選ぶダイアログ。
 * @description フッターは閉じる・取り消す・もう一度送るの 3 操作（左→右）。
 */
export function AlbumDetailPendingUploadRetryDialog({
  open,
  onOpenChange,
  mode,
  onCancelPending,
  onRetry,
}: AlbumDetailPendingUploadRetryDialogProps) {
  const isPendingRetry = mode === 'pending-retry';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isPendingRetry ? '送信待ちです' : '送信に失敗しました'}
          </DialogTitle>
          <DialogDescription className="text-left leading-relaxed">
            {isPendingRetry
              ? '今すぐ送るか、この送信待ちを取り消せます。'
              : 'もう一度送るか、この送信待ちを取り消せます。'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="dialog"
            onClick={() => onOpenChange(false)}
          >
            閉じる
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="dialog"
            onClick={onCancelPending}
          >
            取り消す
          </Button>
          <Button type="button" size="dialog" onClick={onRetry}>
            もう一度送る
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
