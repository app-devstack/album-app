import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface AlbumDetailSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTitle: string;
  onEditTitleChange: (title: string) => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  accentBg: string;
  accentBgHover: string;
}

export function AlbumDetailSettingsDialog({
  open,
  onOpenChange,
  editTitle,
  onEditTitleChange,
  onSave,
  onDelete,
  accentBg,
  accentBgHover,
}: AlbumDetailSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>アルバム設定</DialogTitle>
          <DialogDescription>
            アルバムのタイトルとカバー写真を変更できます。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="album-title" className="text-sm font-medium">
              タイトル
            </label>
            <Input
              id="album-title"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
            />
          </div>
          {/* カバー写真はアルバム内の最新写真を使用するため、プリセット選択は不要 */}
        </div>
        <div className="flex justify-between items-center">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 size={14} className="mr-1.5" />
            アルバムを削除
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button
              onClick={onSave}
              className={cn('text-white', accentBg, accentBgHover)}
            >
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
