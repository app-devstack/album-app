import {
  parseAlbumDetailPhoneColumns,
  type AlbumDetailPhoneColumns,
} from '@/lib/album-detail-grid-pinch';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AlbumDetailGridStore = {
  phoneColumns: AlbumDetailPhoneColumns;
  setPhoneColumns: (columns: AlbumDetailPhoneColumns) => void;
};

/** アルバム詳細のスマホ列数。localStorage に残す。 */
export const useAlbumDetailGridStore = create<AlbumDetailGridStore>()(
  persist(
    (set) => ({
      phoneColumns: 2,
      setPhoneColumns: (phoneColumns) =>
        set({ phoneColumns: parseAlbumDetailPhoneColumns(phoneColumns) }),
    }),
    {
      name: 'album-detail-grid',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ phoneColumns: state.phoneColumns }),
      merge: (persisted, current) => ({
        ...current,
        phoneColumns: parseAlbumDetailPhoneColumns(
          (persisted as Partial<AlbumDetailGridStore> | undefined)?.phoneColumns
        ),
      }),
    }
  )
);
