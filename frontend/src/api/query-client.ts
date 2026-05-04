import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

function isAuthError(err: unknown): boolean {
  return err instanceof AxiosError && err.response?.status === 401;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (count, err) => (isAuthError(err) ? false : count < 2),
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});
