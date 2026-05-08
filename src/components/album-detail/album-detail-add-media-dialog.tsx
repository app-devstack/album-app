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
import { type AccentColorConfig } from '@/lib/data';
import { cn } from '@/lib/utils';
import { FileUp, ImageIcon } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';

const ACCEPT = 'image/*,video/*';

interface AlbumDetailAddMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesSelected: (files: File[]) => void;
  accentConfig: AccentColorConfig;
}

export function AlbumDetailAddMediaDialog({
  open,
  onOpenChange,
  onFilesSelected,
  accentConfig,
}: AlbumDetailAddMediaDialogProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const emitFiles = useCallback(
    (fileList: FileList | File[] | null) => {
      const files = Array.from(fileList ?? []);
      if (!files.length) return;
      onFilesSelected(files);
      onOpenChange(false);
      if (inputRef.current) inputRef.current.value = '';
    },
    [onFilesSelected, onOpenChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    emitFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (dropped.length) emitFiles(dropped);
  };

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="font-sans text-lg font-medium">
              メディアを追加
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              このアルバムに写真や動画を追加します。複数ファイルを一度に選べます。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              ファイルの選択
            </p>

            <input
              ref={inputRef}
              id={inputId}
              type="file"
              multiple
              accept={ACCEPT}
              className="sr-only"
              onChange={handleInputChange}
            />

            <label
              htmlFor={inputId}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-5 py-10 text-center transition-[color,background-color,border-color,box-shadow]',
                'border-muted-foreground/25 hover:border-muted-foreground/45 hover:bg-muted/45',
                'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                isDragging &&
                  'border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-2 ring-offset-background'
              )}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                <FileUp className="h-6 w-6 text-muted-foreground" aria-hidden />
              </div>
              <span className="text-sm font-medium text-foreground">
                ここにドラッグ＆ドロップ
              </span>
              <span className="mt-1 text-xs text-muted-foreground leading-relaxed">
                またはエリア内をクリックして、デバイスからファイルを選びます。
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2.5 py-1 text-[11px] text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                対応形式：画像・動画（複数選択可）
              </span>
            </label>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/20 px-6 py-4 sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            type="button"
            className={cn(
              'text-white gap-2',
              accentConfig.bg,
              accentConfig.bgHover
            )}
            onClick={handleOpenPicker}
          >
            <FileUp className="h-4 w-4" aria-hidden />
            ファイルを選ぶ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
