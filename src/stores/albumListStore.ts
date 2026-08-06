import {
  DEFAULT_ALBUM_SORT_ORDER,
  type AlbumSortOrder,
} from '@/lib/album-sort-order';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 一覧の表示モード（リスト / グリッド）。 */
export type AlbumListViewMode = 'list' | 'grid';

/** 一覧グリッドの列密度（2列基準 / 3列基準）。 */
export type AlbumGridDensity = 'comfortable' | 'compact';

type AlbumListStore = {
  viewMode: AlbumListViewMode;
  setViewMode: (mode: AlbumListViewMode) => void;
  gridDensity: AlbumGridDensity;
  setGridDensity: (density: AlbumGridDensity) => void;
  sortOrder: AlbumSortOrder;
  setSortOrder: (order: AlbumSortOrder) => void;
};

/** アルバム一覧の表示設定（表示モード・列密度・ソート等）。localStorage に永続化する。 */
export const useAlbumListStore = create<AlbumListStore>()(
  persist(
    (set) => ({
      viewMode: 'list',
      gridDensity: 'comfortable',
      sortOrder: DEFAULT_ALBUM_SORT_ORDER,
      setViewMode: (viewMode) => set({ viewMode }),
      setGridDensity: (gridDensity) => set({ gridDensity }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
    }),
    {
      name: 'album-list',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        gridDensity: state.gridDensity,
        sortOrder: state.sortOrder,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AlbumListStore>),
        viewMode:
          (persisted as Partial<AlbumListStore>)?.viewMode ?? current.viewMode,
      }),
    }
  )
);
