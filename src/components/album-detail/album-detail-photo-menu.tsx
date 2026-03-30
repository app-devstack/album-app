'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical, Trash2 } from 'lucide-react';

interface AlbumDetailPhotoMenuProps {
  onDelete: () => void;
}

export function AlbumDetailPhotoMenu({ onDelete }: AlbumDetailPhotoMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 hover:bg-muted/50 hover:text-white right-2 z-10 text-white transition-opacity"
          onClick={(e) => e.stopPropagation()}
          aria-label="メニューを開く"
        >
          <EllipsisVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm('この写真を削除してもよろしいですか？')) {
              onDelete();
            }
          }}
        >
          <Trash2 size={14} />
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
