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
      aria-label="メディアを追加"
    >
      <ImagePlus size={24} />
      <span className="text-xs mt-2">追加</span>
    </button>
  );
}
