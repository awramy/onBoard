import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/stores/auth.store';

export function PublicRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token));

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
}
