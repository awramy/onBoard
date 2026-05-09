import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  useSessionsControllerAbandon,
  getSessionsControllerFindAllQueryKey,
} from '@/api/generated/react-query';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROUTES } from '@/routes/routes';

export function useAbandonSession() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const mutation = useSessionsControllerAbandon({
    mutation: {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: getSessionsControllerFindAllQueryKey() });
        toast.info(t('sessionChat.controlPanel.abandon'));
        void navigate(ROUTES.SESSIONS);
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err));
      },
    },
  });
  return mutation;
}
