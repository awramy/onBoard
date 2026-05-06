import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useSessionsControllerCreate,
  useSessionsControllerStart,
} from '@/api/generated/react-query';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROUTES } from '@/routes/routes';

type StartSessionParams = {
  technologyLevelId: string;
  questionsCount: number;
  model: string;
};

export function useStartSession() {
  const navigate = useNavigate();
  const createMutation = useSessionsControllerCreate();
  const startMutation = useSessionsControllerStart();

  const isPending = createMutation.isPending || startMutation.isPending;

  async function start({ technologyLevelId, questionsCount, model }: StartSessionParams) {
    try {
      const session = await createMutation.mutateAsync({
        data: {
          technologyLevelId,
          config: { format: 'text-text', questions_count: questionsCount, model },
        },
      });

      await startMutation.mutateAsync({ id: session.id });
      void navigate(ROUTES.SESSION_CHAT(session.id));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return { start, isPending };
}
