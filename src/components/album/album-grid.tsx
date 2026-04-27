'use client';

import { AlbumCard } from '@/components/album/album-card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Album } from '@/db/schema';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  useAlbumListStore,
  type AlbumGridDensity,
} from '@/stores/albumListStore';
import { Plus } from 'lucide-react';

interface AlbumGridProps {
  albums: Album[];
  accent: AccentColor;
  onAlbumClick: (album: Album) => void;
  onCreateClick: () => void;
}

const GRID_CLASS: Record<AlbumGridDensity, string> = {
  comfortable: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5',
  compact: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4',
};

/** 一覧ヘッダー右側の列数トグル（2列基準 / 3列基準）。 */
function AlbumGridDensityToggle() {
  const gridDensity = useAlbumListStore((s) => s.gridDensity);
  const setGridDensity = useAlbumListStore((s) => s.setGridDensity);

  return (
    <ToggleGroup
      type="single"
      value={gridDensity}
      onValueChange={(value) => {
        if (value === 'comfortable' || value === 'compact') {
          setGridDensity(value);
        }
      }}
      variant="outline"
      size="sm"
      className="shrink-0"
      aria-label="1行あたりの列数"
    >
      <ToggleGroupItem
        value="comfortable"
        className="px-2.5 text-xs sm:text-sm"
        aria-label="2列表示（見やすさ優先）"
      >
        2列
      </ToggleGroupItem>
      <ToggleGroupItem
        value="compact"
        className="px-2.5 text-xs sm:text-sm"
        aria-label="3列表示（一覧密度優先）"
      >
        3列
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

/** グループのアルバムをグリッドで一覧表示し、列密度の切り替えと新規作成 FAB を提供する。 */
export function AlbumGrid({
  albums,
  accent,
  onAlbumClick,
  onCreateClick,
}: AlbumGridProps) {
  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;
  const gridDensity = useAlbumListStore((s) => s.gridDensity);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* ページタイトル */}
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="font-sans text-2xl font-medium text-foreground tracking-wide text-balance">
            アルバム一覧
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            全{albums.length}冊
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:pt-0.5">
          <AlbumGridDensityToggle />
        </div>
      </div>

      {/* グリッド */}
      <div className={cn('grid', GRID_CLASS[gridDensity])}>
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            accent={accent}
            gridDensity={gridDensity}
            onClick={() => onAlbumClick(album)}
          />
        ))}
      </div>

      {/* 新規作成ボタン (FAB) */}
      <button
        onClick={onCreateClick}
        aria-label="新しいアルバムを作る"
        className={cn(
          'fixed bottom-6 right-6 h-13 w-13 rounded-full shadow-lg flex items-center justify-center',
          'transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          accentConfig.bg,
          accentConfig.bgHover,
          accentConfig.ring,
          'text-white'
        )}
      >
        <Plus size={22} strokeWidth={2} />
      </button>
    </main>
  );
}
