export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  defaultLang: import.meta.env.VITE_DEFAULT_LANG ?? 'ru',
  enableFavoritesApi: import.meta.env.VITE_ENABLE_FAVORITES_API === 'true',
  enableAvatarUpload: import.meta.env.VITE_ENABLE_AVATAR_UPLOAD === 'true',
  showUiKit: import.meta.env.VITE_SHOW_UI_KIT === 'true',
};
