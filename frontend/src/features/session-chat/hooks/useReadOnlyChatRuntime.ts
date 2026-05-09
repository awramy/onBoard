import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useExternalStoreRuntime } from '@assistant-ui/react';
import type { ThreadMessageLike } from '@assistant-ui/react';
import { useSessionsControllerFindOne } from '@/api/generated/react-query';
import { ROUTES } from '@/routes/routes';
import { hydrateFromSession } from '../lib/messageBuilders';

export function useReadOnlyChatRuntime(sessionId: string) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const session = useSessionsControllerFindOne(sessionId, undefined, {
    query: { retry: false },
  });

  const messages = useMemo<ThreadMessageLike[]>(() => {
    if (!session.data) return [];
    return hydrateFromSession(session.data, t('sessionChat.skipFeedback'));
  }, [session.data, t]);

  useEffect(() => {
    if (!session.error) return;
    const err = session.error as { response?: { status?: number } };
    if (err.response?.status === 403) {
      toast.error(t('sessionChat.errors.forbidden'));
      void navigate(ROUTES.SESSIONS, { replace: true });
    } else if (err.response?.status === 404) {
      void navigate('/404', { replace: true });
    }
  }, [session.error, navigate, t]);

  const runtime = useExternalStoreRuntime<ThreadMessageLike>({
    isRunning: false,
    isDisabled: true,
    messages,
    convertMessage: (m) => m,
    onNew: async () => {},
  });

  return {
    runtime,
    sessionData: session.data,
    isLoading: session.isLoading,
    error: session.error,
  };
}
