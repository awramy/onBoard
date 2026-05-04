import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthControllerLogin } from '@/api/generated/react-query';
import { queryClient } from '@/api/query-client';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/stores/auth.store';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useAuthControllerLogin({
    mutation: {
      onSuccess: ({ access_token, user }) => {
        setAuth({ token: access_token, user });
        queryClient.setQueryData(['/users/me'], user);
        void navigate(ROUTES.DASHBOARD, { replace: true });
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err));
      },
    },
  });
}
