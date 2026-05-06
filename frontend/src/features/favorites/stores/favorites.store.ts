import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoritesState = {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) =>
        set((state) => ({
          ids: state.ids.includes(id) ? state.ids : [...state.ids, id],
        })),
      remove: (id) =>
        set((state) => ({ ids: state.ids.filter((i) => i !== id) })),
      toggle: (id) => {
        if (get().has(id)) {
          get().remove(id);
        } else {
          get().add(id);
        }
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: 'onboard-favorites' },
  ),
);
