import { useQueryClient } from '@tanstack/react-query';
import {
  useSessionsControllerFinish,
  getSessionsControllerFindOneQueryKey,
  getSessionsControllerFindAllQueryKey,
  getUsersControllerGetProfileQueryKey,
} from '@/api/generated/react-query';

export function useFinishSession(sessionId: string) {
  const qc = useQueryClient();
  return useSessionsControllerFinish({
    mutation: {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: getSessionsControllerFindOneQueryKey(sessionId) });
        void qc.invalidateQueries({ queryKey: getSessionsControllerFindAllQueryKey() });
        void qc.invalidateQueries({ queryKey: getUsersControllerGetProfileQueryKey() });
      },
    },
  });
}
