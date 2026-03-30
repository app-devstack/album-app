'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGroupContext } from '@/contexts/GroupContext';
import { useCreateAlbum } from '@/hooks/fetchers/use-albums';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';

interface CreateAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accent: AccentColor;
  // onAlbumCreate: (album: Album) => void; // No longer needed as we use the hook directly
}

type AlbumType = 'personal' | 'family';

export function CreateAlbumDialog({
  open,
  onOpenChange,
  accent,
}: CreateAlbumDialogProps) {
  const { currentGroupId } = useGroupContext();
  const { mutateAsync: createAlbumMutation } = useCreateAlbum(currentGroupId);
  const [albumName, setAlbumName] = useState('');

  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setAlbumName('');
    }, 300);
  };

  const handleCreate = async () => {
    await createAlbumMutation({
      title: albumName.trim() || '無題のアルバム',
      type: 'family',
      groupId: currentGroupId,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="font-sans text-lg font-medium">
              {'アルバムの詳細'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {'アルバム名を設定してください。'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            {/* アルバム名 */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                アルバム名
              </label>
              <Input
                placeholder="例：夏の家族旅行"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="focus-visible:ring-1 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>
          </div>

          {/* フッター操作 */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft size={13} />
              戻る
            </Button>

            <Button
              size="sm"
              onClick={handleCreate}
              className={cn(
                'gap-1.5 text-white',
                accentConfig.bg,
                accentConfig.bgHover
              )}
            >
              作成する
              <Check size={13} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
