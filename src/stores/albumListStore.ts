import {
  DEFAULT_ALBUM_SORT_ORDER,
  type AlbumSortOrder,
} from '@/lib/album-sort-order';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 一覧グリッドの列密度（2列基準 / 3列基準）。 */
export type AlbumGridDensity = 'comfortable' | 'compact';

type AlbumListStore = {
  gridDensity: AlbumGridDensity;
  setGridDensity: (density: AlbumGridDensity) => void;
  sortOrder: AlbumSortOrder;
  setSortOrder: (order: AlbumSortOrder) => void;
};

/** アルバム一覧の表示設定（列密度・ソート等）。localStorage に永続化する。 */
export const useAlbumListStore = create<AlbumListStore>()(
  persist(
    (set) => ({
      gridDensity: 'comfortable',
      sortOrder: DEFAULT_ALBUM_SORT_ORDER,
      setGridDensity: (gridDensity) => set({ gridDensity }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
    }),
    {
      name: 'album-list',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gridDensity: state.gridDensity,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
