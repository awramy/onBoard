import { useFavoritesStore } from '../stores/favorites.store';

export function useFavoriteIds() {
  return useFavoritesStore((state) => state.ids);
}
