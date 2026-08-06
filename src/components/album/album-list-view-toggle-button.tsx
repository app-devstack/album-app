'use client';

import { Button } from '@/components/ui/button';
import { useAlbumListStore } from '@/stores/albumListStore';
import { LayoutGrid, List } from 'lucide-react';

/** 一覧ヘッダーのリスト / グリッド切替トグル。 */
export function AlbumListViewToggleButton() {
  const viewMode = useAlbumListStore((s) => s.viewMode);
  const setViewMode = useAlbumListStore((s) => s.setViewMode);

  const isList = viewMode === 'list';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0"
      aria-label={isList ? 'グリッド表示に切り替え' : 'リスト表示に切り替え'}
      aria-pressed={isList}
      onClick={() => setViewMode(isList ? 'grid' : 'list')}
    >
      {isList ? (
        <LayoutGrid className="size-4" aria-hidden />
      ) : (
        <List className="size-4" aria-hidden />
      )}
    </Button>
  );
}
