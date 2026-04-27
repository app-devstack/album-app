import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 一覧グリッドの列密度（2列基準 / 3列基準）。 */
export type AlbumGridDensity = 'comfortable' | 'compact';

type AlbumListStore = {
  gridDensity: AlbumGridDensity;
  setGridDensity: (density: AlbumGridDensity) => void;
};

/** アルバム一覧の表示設定（列密度など）。localStorage に永続化する。 */
export const useAlbumListStore = create<AlbumListStore>()(
  persist(
    (set) => ({
      gridDensity: 'comfortable',
      setGridDensity: (gridDensity) => set({ gridDensity }),
    }),
    {
      name: 'album-list',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ gridDensity: state.gridDensity }),
    }
  )
);
