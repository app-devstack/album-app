import { ImagePlus } from 'lucide-react';

interface AlbumDetailAddMediaCellProps {
  onAddClick: () => void;
}

export function AlbumDetailAddMediaCell({
  onAddClick,
}: AlbumDetailAddMediaCellProps) {
  return (
    <button
      className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted hover:border-muted-foreground/50 transition-colors"
      onClick={onAddClick}
      aria-label="メディアを追加（写真・動画を選択）"
    >
      <ImagePlus size={24} className="shrink-0" aria-hidden />
      <span className="text-xs mt-2 font-medium">メディアを追加</span>
      <span className="text-[10px] text-muted-foreground/90 mt-0.5 px-1 leading-tight">
        タップして選択
      </span>
    </button>
  );
}
