import axios, { type AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

export const httpInstance = axios.create({
  baseURL: env.apiBaseUrl,
});

httpInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lang = localStorage.getItem('i18nextLng') ?? env.defaultLang;
  config.headers['Accept-Language'] = lang;
  return config;
});

httpInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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
