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
import { Trash2 } from 'lucide-react';

/** 送信待ち削除確認ダイアログに渡すプロパティ。 */
export interface AlbumDetailPendingUploadDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * 送信待ちメディアの削除（キュー取消）を最終確認するダイアログ。
 * @description Native キャンセルは同期のため busy 状態は持たない。
 */
export function AlbumDetailPendingUploadDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: AlbumDetailPendingUploadDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>送信待ちを削除しますか？</DialogTitle>
          <DialogDescription className="text-left leading-relaxed">
            この画像はアルバムに追加されません。スマホの写真はそのまま残ります。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="dialog"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="dialog"
            onClick={onConfirm}
          >
            <Trash2 size={16} className="mr-1.5 shrink-0" />
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
