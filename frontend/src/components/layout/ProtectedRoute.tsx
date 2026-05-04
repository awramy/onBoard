import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/stores/auth.store';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token));
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
