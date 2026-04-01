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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Photo } from '@/db/schema';
import { cn } from '@/lib/utils';
import { ImageIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AlbumDetailSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTitle: string;
  onEditTitleChange: (title: string) => void;
  onSave: () => Promise<void>;
  photos: Photo[];
  albumCoverUrl: string;
  onSetCoverUrl: (coverUrl: string) => Promise<void>;
  photoUrlForCover: (photo: Photo) => string;
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
  photos,
  albumCoverUrl,
  onSetCoverUrl,
  photoUrlForCover,
  onDelete,
  accentBg,
  accentBgHover,
}: AlbumDetailSettingsDialogProps) {
  const [coverPending, setCoverPending] = useState(false);
  const hasCustomCover = Boolean(albumCoverUrl?.trim());

  const handlePickCover = async (photo: Photo) => {
    const url = photoUrlForCover(photo);
    setCoverPending(true);
    try {
      await onSetCoverUrl(url);
    } finally {
      setCoverPending(false);
    }
  };

  const handleClearCover = async () => {
    setCoverPending(true);
    try {
      await onSetCoverUrl('');
    } finally {
      setCoverPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>アルバム設定</DialogTitle>
          <DialogDescription>
            タイトルの変更、アルバム内の写真からカバー画像を選ぶことができます。未設定のときは最新の写真がカバーとして使われます。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-hidden flex flex-col min-h-0">
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

          <div className="space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">カバー画像</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasCustomCover || coverPending}
                onClick={() => void handleClearCover()}
              >
                <ImageIcon size={14} className="mr-1.5" />
                カバーを外す
              </Button>
            </div>
            {photos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                写真がまだありません。追加するとカバーに設定できます。
              </p>
            ) : (
              <ScrollArea className="h-[min(220px,40vh)] rounded-md border p-2">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pr-2">
                  {photos.map((photo) => {
                    const savedUrl = photoUrlForCover(photo);
                    const isSelected =
                      hasCustomCover && albumCoverUrl.trim() === savedUrl;
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        disabled={coverPending}
                        onClick={() => void handlePickCover(photo)}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden bg-muted ring-offset-2 transition-shadow',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected && 'ring-2 ring-primary ring-offset-2'
                        )}
                        aria-label={`カバーに設定: ${photo.alt}`}
                        aria-pressed={isSelected}
                      >
                        <img
                          src={`/api/photos/${photo.id}/optimized?mode=thumb`}
                          alt=""
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center shrink-0">
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
