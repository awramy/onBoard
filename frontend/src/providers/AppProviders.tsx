import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/api/query-client';
import { i18n } from '@/i18n';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          {children}
          <Toaster richColors position="top-right" />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </ErrorBoundary>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
