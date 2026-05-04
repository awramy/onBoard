import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import { env } from '@/config/env';
import { i18n } from '@/i18n';
import { useAuthStore } from '@/stores/auth.store';

export const httpInstance = axios.create({
  baseURL: env.apiBaseUrl,
});

httpInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lang = i18n.resolvedLanguage ?? env.defaultLang;
  config.headers['Accept-Language'] = lang;
  return config;
});

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register'];

httpInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? '';
      const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => url.includes(ep));

      if (!isAuthEndpoint) {
        useAuthStore.getState().logout();
        toast.error(i18n.t('errors.api.sessionExpired'));
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export const customReactQueryAxios = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = httpInstance<T>({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error cancel is attached by orval convention
  promise.cancel = () => {
    source.cancel('Query was cancelled by orval');
  };

  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
