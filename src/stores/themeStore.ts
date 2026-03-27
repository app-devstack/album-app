import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AccentColor } from '@/lib/data';

type AccentStore = {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
};

export const useAccentStore = create<AccentStore>()(
  persist(
    (set) => ({
      accent: 'blue',
      setAccent: (accent) => set({ accent }),
    }),
    {
      name: 'accent-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
