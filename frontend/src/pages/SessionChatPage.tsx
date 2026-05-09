import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/routes/routes';
import { useChatRuntime } from '@/features/session-chat/hooks/useChatRuntime';
import { useAbandonSession } from '@/features/session-chat/hooks/useAbandonSession';
import { ChatThread } from '@/features/session-chat/components/ChatThread';
import { SessionControlPanel } from '@/features/session-chat/components/SessionControlPanel';
import { SummaryDialog } from '@/features/session-chat/components/SummaryDialog';
import { ConfirmAbandonDialog } from '@/features/session-chat/components/ConfirmAbandonDialog';
import { PlannedSessionPlaceholder } from '@/features/session-chat/components/PlannedSessionPlaceholder';

export default function SessionChatPage() {
  const { id } = useParams<{ id: string }>();
  const [abandonOpen, setAbandonOpen] = useState(false);

  const {
    runtime,
    sessionData,
    isLoading,
    summaryResult,
    handleSend,
    handleSkip,
    handleRetry,
    handleFinishEarly,
    isRunning,
  } = useChatRuntime(id!);

  const abandon = useAbandonSession();

  if (!id) return <Navigate to={ROUTES.SESSIONS} replace />;

  if (sessionData?.status === 'completed' || sessionData?.status === 'abandoned') {
    return <Navigate to={ROUTES.SESSION_HISTORY(id)} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (sessionData?.status === 'planned') {
    return <PlannedSessionPlaceholder sessionId={id} />;
  }

  const controlPanel = sessionData ? (
    <SessionControlPanel
      session={sessionData}
      onFinishEarly={() => void handleFinishEarly()}
      onAbandon={() => setAbandonOpen(true)}
      isRunning={isRunning}
    />
  ) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-var(--app-header-h,64px))]">
      {/* Mobile FAB for control panel */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Sheet>
          <SheetTrigger
            render={
              <Button size="icon" variant="secondary" aria-label="panel">
                <PanelRight className="size-4" />
              </Button>
            }
          />
          <SheetContent side="right" className="p-0 w-80">
            {controlPanel}
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Chat area */}
        <div className="flex-1 min-w-0">
          <ChatThread
            runtime={runtime}
            mode="live"
            sessionId={id}
            onSend={handleSend}
            onSkip={() => void handleSkip()}
            onRetry={handleRetry}
            isRunning={isRunning}
          />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:w-80 border-l flex-col">
          {controlPanel}
        </div>
      </div>

      {summaryResult && (
        <SummaryDialog
          open={true}
          result={summaryResult}
          sessionId={id}
        />
      )}

      <ConfirmAbandonDialog
        open={abandonOpen}
        onOpenChange={setAbandonOpen}
        onConfirm={() => void abandon.mutateAsync({ id })}
        isPending={abandon.isPending}
      />
    </div>
  );
}
