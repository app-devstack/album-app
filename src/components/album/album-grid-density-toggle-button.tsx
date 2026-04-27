'use client';

import { Button } from '@/components/ui/button';
import { useAlbumListStore } from '@/stores/albumListStore';
import { Grid2x2Icon, Grid3x2Icon } from 'lucide-react';

export interface AlbumGridDensityToggleButtonProps {
  onBeforeDensityChange?: () => void;
}

/** 一覧ヘッダーの列数トグル（2列基準 / 3列基準）。 */
export function AlbumGridDensityToggleButton({
  onBeforeDensityChange,
}: AlbumGridDensityToggleButtonProps) {
  const gridDensity = useAlbumListStore((s) => s.gridDensity);
  const setGridDensity = useAlbumListStore((s) => s.setGridDensity);

  const isComfortable = gridDensity === 'comfortable';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0"
      aria-label={
        isComfortable
          ? '3列表示に切り替え（一覧密度優先）'
          : '2列表示に切り替え（見やすさ優先）'
      }
      aria-pressed={isComfortable}
      onClick={() => {
        onBeforeDensityChange?.();
        setGridDensity(isComfortable ? 'compact' : 'comfortable');
      }}
    >
      {isComfortable ? (
        <Grid3x2Icon className="size-4" aria-hidden />
      ) : (
        <Grid2x2Icon className="size-4" aria-hidden />
      )}
    </Button>
  );
}
