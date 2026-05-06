import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useSessionsControllerStart,
  getSessionsControllerFindAllQueryKey,
} from '@/api/generated/react-query';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROUTES } from '@/routes/routes';

export function useStartPlannedSession() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const startMutation = useSessionsControllerStart();

  async function start(sessionId: string) {
    try {
      await startMutation.mutateAsync({ id: sessionId });
      await queryClient.invalidateQueries({
        queryKey: getSessionsControllerFindAllQueryKey(),
      });
      void navigate(ROUTES.SESSION_CHAT(sessionId));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return { start, isPending: startMutation.isPending };
}
