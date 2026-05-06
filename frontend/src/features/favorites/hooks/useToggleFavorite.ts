import { useFavoritesStore } from '../stores/favorites.store';

export function useToggleFavorite(id: string) {
  const toggle = useFavoritesStore((state) => state.toggle);
  const has = useFavoritesStore((state) => state.has);
  return {
    isFavorite: has(id),
    toggle: () => toggle(id),
  };
}
