import { useSessionsControllerGetQuestionHistory } from '@/api/generated/react-query';

export function useQuestionHistory(
  sessionId: string,
  sessionQuestionId: string,
  options?: { enabled?: boolean },
) {
  return useSessionsControllerGetQuestionHistory(sessionId, sessionQuestionId, {
    query: {
      enabled: !!sessionId && !!sessionQuestionId && (options?.enabled ?? true),
      retry: false,
      staleTime: 60_000,
    },
  });
}
