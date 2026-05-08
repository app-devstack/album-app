import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 端末内に保持する開発用メモ1件。 */
export type DevMemo = {
  id: string;
  text: string;
  updatedAt: number;
};

type DevMemoStore = {
  memos: DevMemo[];
  addMemo: (text: string) => void;
  updateMemo: (id: string, text: string) => void;
  removeMemo: (id: string) => void;
};

/** 開発用メモを local storage に永続化する。 */
export const useDevMemoStore = create<DevMemoStore>()(
  persist(
    (set) => ({
      memos: [],
      addMemo: (text) => {
        set((s) => ({
          memos: [
            ...s.memos,
            {
              id: crypto.randomUUID(),
              text,
              updatedAt: Date.now(),
            },
          ],
        }));
      },
      updateMemo: (id, text) => {
        set((s) => ({
          memos: s.memos.map((m) =>
            m.id === id ? { ...m, text, updatedAt: Date.now() } : m
          ),
        }));
      },
      removeMemo: (id) => {
        set((s) => ({ memos: s.memos.filter((m) => m.id !== id) }));
      },
    }),
    {
      name: 'dev-memos',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ memos: state.memos }),
    }
  )
);
