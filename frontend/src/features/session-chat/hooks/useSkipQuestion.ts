import { useQueryClient } from '@tanstack/react-query';
import {
  useSessionsControllerSkip,
  getSessionsControllerFindOneQueryKey,
  getSessionsControllerCurrentQuestionQueryKey,
  getSessionsControllerFindAllQueryKey,
} from '@/api/generated/react-query';

export function useSkipQuestion(sessionId: string) {
  const qc = useQueryClient();
  return useSessionsControllerSkip({
    mutation: {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: getSessionsControllerFindOneQueryKey(sessionId) });
        void qc.invalidateQueries({ queryKey: getSessionsControllerCurrentQuestionQueryKey(sessionId) });
        void qc.invalidateQueries({ queryKey: getSessionsControllerFindAllQueryKey() });
      },
    },
  });
}
