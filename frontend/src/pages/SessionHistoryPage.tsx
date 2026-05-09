import { useParams, Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/routes/routes';
import { useReadOnlyChatRuntime } from '@/features/session-chat/hooks/useReadOnlyChatRuntime';
import { ChatThread } from '@/features/session-chat/components/ChatThread';
import { HistoryHeader } from '@/features/session-chat/components/HistoryHeader';

export default function SessionHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { runtime, sessionData, isLoading } = useReadOnlyChatRuntime(id!);

  if (!id) return <Navigate to={ROUTES.SESSIONS} replace />;

  if (sessionData?.status === 'in_progress') {
    return <Navigate to={ROUTES.SESSION_CHAT(id)} replace />;
  }

  if (sessionData?.status === 'planned') {
    return <Navigate to={ROUTES.SESSIONS} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (sessionData && sessionData.questions.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-var(--app-header-h,64px))]">
        <HistoryHeader session={sessionData} />
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          {/* t('sessionChat.history.noAnswers') */}
          {sessionData ? 'Эта сессия не была начата' : ''}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--app-header-h,64px))]">
      {sessionData && <HistoryHeader session={sessionData} />}
      <div className="flex-1 min-h-0">
        <ChatThread
          runtime={runtime}
          mode="history"
          sessionId={id}
          onSend={() => {}}
          onSkip={() => {}}
          onRetry={() => {}}
          isRunning={false}
        />
      </div>
    </div>
  );
}
