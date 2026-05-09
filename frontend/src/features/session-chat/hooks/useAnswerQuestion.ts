import { useQueryClient } from '@tanstack/react-query';
import {
  useSessionsControllerAnswer,
  getSessionsControllerFindOneQueryKey,
  getSessionsControllerCurrentQuestionQueryKey,
  getSessionsControllerFindAllQueryKey,
} from '@/api/generated/react-query';

export function useAnswerQuestion(sessionId: string) {
  const qc = useQueryClient();
  return useSessionsControllerAnswer({
    mutation: {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: getSessionsControllerFindOneQueryKey(sessionId) });
        void qc.invalidateQueries({ queryKey: getSessionsControllerCurrentQuestionQueryKey(sessionId) });
        void qc.invalidateQueries({ queryKey: getSessionsControllerFindAllQueryKey() });
      },
    },
  });
}
