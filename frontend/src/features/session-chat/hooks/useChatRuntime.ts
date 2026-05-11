import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useExternalStoreRuntime } from '@assistant-ui/react';
import type { ThreadMessageLike } from '@assistant-ui/react';
import type { FinishResultDto } from '@/api/generated/schemas';
import {
  useSessionsControllerFindOne,
  useSessionsControllerCurrentQuestion,
} from '@/api/generated/react-query';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROUTES } from '@/routes/routes';
import { useAnswerQuestion } from './useAnswerQuestion';
import { useSkipQuestion } from './useSkipQuestion';
import { useFinishSession } from './useFinishSession';
import { useDraftAnswer } from './useDraftAnswer';
import {
  hydrateFromSession,
  makeQuestionMessage,
  makeUserMessage,
  makeEvaluationMessage,
  makeSkipEvaluationMessage,
  makeErrorMessage,
} from '../lib/messageBuilders';

export function useChatRuntime(sessionId: string) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clearDraft } = useDraftAnswer(sessionId);

  const [messages, setMessages] = useState<ThreadMessageLike[]>([]);
  const [isRunning, setRunning] = useState(false);
  const [summaryResult, setSummaryResult] = useState<FinishResultDto | null>(null);
  const hydratedRef = useRef(false);

  const session = useSessionsControllerFindOne(sessionId, undefined, {
    query: { retry: false },
  });

  const currentQ = useSessionsControllerCurrentQuestion(sessionId, {
    query: {
      enabled: session.data?.status === 'in_progress',
      retry: false,
    },
  });

  const answer = useAnswerQuestion(sessionId);
  const skip = useSkipQuestion(sessionId);
  const finish = useFinishSession(sessionId);

  // Гидрация — один раз при загрузке
  useEffect(() => {
    if (!session.data || hydratedRef.current) return;
    if (session.data.status === 'planned') return;
    setMessages(hydrateFromSession(session.data, t('sessionChat.skipFeedback')));
    hydratedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data?.id]);

  // Добавляем текущий вопрос, если его ещё нет в треде
  useEffect(() => {
    if (!currentQ.data || !hydratedRef.current) return;
    const exists = messages.some(
      (m) =>
        m.id === `q-${currentQ.data!.id}`,
    );
    if (!exists) {
      setMessages((prev) => [
        ...prev,
        makeQuestionMessage(currentQ.data!, session.data?.totalQuestions ?? null),
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ.data?.id]);

  // Обработка 403 / 404
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

  async function handleSend(text: string) {
    if (!text.trim() || isRunning) return;
    const order = currentQ.data?.order ?? 0;
    setMessages((prev) => [...prev, makeUserMessage(text, order)]);
    setRunning(true);
    try {
      const res = await answer.mutateAsync({ id: sessionId, data: { answerText: text } });
      clearDraft();
      const next: ThreadMessageLike[] = [makeEvaluationMessage(res)];
      if (!res.isFinished && res.nextQuestion) {
        next.push(
          makeQuestionMessage(
            {
              id: res.nextQuestion.id,
              questionId: null,
              questionText: res.nextQuestion.questionText,
              difficulty: res.nextQuestion.difficulty,
              isClarifying: res.nextQuestion.isClarifying,
              order: res.nextQuestion.order,
            },
            session.data?.totalQuestions ?? null,
          ),
        );
      }
      setMessages((prev) => [...prev, ...next]);
      if (res.isFinished) {
        setSummaryResult({
          sessionId,
          status: res.status,
          totalQuestions: session.data?.totalQuestions ?? 0,
          questionsAnswered: res.currentOrder - 1,
          avgScore: computeAvgScore([...messages, makeEvaluationMessage(res)]),
          sessionScore: 0,
          newFullScore: 0,
          newLeague: '',
        });
      }
    } catch (err) {
      setMessages((prev) => [...prev, makeErrorMessage(text, getApiErrorMessage(err))]);
    } finally {
      setRunning(false);
    }
  }

  async function handleSkip() {
    if (isRunning) return;
    setRunning(true);
    try {
      const res = await skip.mutateAsync({ id: sessionId });
      setMessages((prev) => [...prev, makeSkipEvaluationMessage(t('sessionChat.skipFeedback'))]);
      if (res.isFinished) {
        setSummaryResult({
          sessionId,
          status: res.status,
          totalQuestions: session.data?.totalQuestions ?? 0,
          questionsAnswered: res.currentOrder - 1,
          avgScore: computeAvgScore(messages),
          sessionScore: 0,
          newFullScore: 0,
          newLeague: '',
        });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  async function handleRetry(text: string) {
    // Убираем последнее сообщение с ошибкой
    setMessages((prev) => prev.filter((m) => m.metadata?.custom?.kind !== 'error' || prev.indexOf(m) !== prev.length - 1));
    await handleSend(text);
  }

  async function handleFinishEarly() {
    if (isRunning) return;
    setRunning(true);
    try {
      const res = await finish.mutateAsync({ id: sessionId });
      setSummaryResult(res);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  const runtime = useExternalStoreRuntime<ThreadMessageLike>({
    isRunning,
    messages,
    convertMessage: (m) => m,
    onNew: async ({ content }) => {
      const text = content.find((c) => c.type === 'text')?.text ?? '';
      await handleSend(text);
    },
  });

  return {
    runtime,
    sessionData: session.data,
    isLoading: session.isLoading,
    error: session.error,
    summaryResult,
    clearSummary: () => setSummaryResult(null),
    handleSend,
    handleSkip,
    handleRetry,
    handleFinishEarly,
    isRunning,
  };
}

function computeAvgScore(messages: ThreadMessageLike[]): number {
  const scores = messages
    .filter((m) => m.metadata?.custom?.kind === 'evaluation')
    .map((m) => (m.metadata!.custom as { score?: number }).score ?? 0);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
