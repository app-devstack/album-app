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
import { useState } from 'react';

/** アルバム削除確認ダイアログに渡すプロパティ。 */
export interface AlbumDetailDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
}

/**
 * アルバム削除の最終確認を表示するダイアログ。
 * @description 確定時に非同期削除を実行し、処理中はボタンを無効化する。
 */
export function AlbumDetailDeleteDialog({
  open,
  onOpenChange,
  onDelete,
}: AlbumDetailDeleteDialogProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

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
        onPointerDownOutside={(e) => busy && e.preventDefault()}
        onEscapeKeyDown={(e) => busy && e.preventDefault()}
        onInteractOutside={(e) => busy && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>アルバムを削除しますか？</DialogTitle>
          <DialogDescription className="text-left leading-relaxed">
            この操作は取り消せません。アルバム内の写真・動画もすべて削除されます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="dialog"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="dialog"
            disabled={busy}
            onClick={() => void handleConfirm()}
          >
            <Trash2 size={16} className="mr-1.5 shrink-0" />
            アルバムを削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
