import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/routes';
import type { SessionDto } from '@/api/generated/schemas';
import { SessionsTabs, type SessionTab } from '@/features/sessions/components/SessionsTabs';
import { SessionsList } from '@/features/sessions/components/SessionsList';
import { StartSessionDialog } from '@/features/sessions/components/StartSessionDialog';
import { StartPlannedDialog } from '@/features/sessions/components/StartPlannedDialog';
import { useSessionsList } from '@/features/sessions/hooks/useSessionsList';

export default function SessionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tab, setTab] = useState<SessionTab>('active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmingSession, setConfirmingSession] = useState<SessionDto | null>(null);

  const { items, total, isLoading, isFetching, hasMore, loadMore } =
    useSessionsList(tab);

  function handleCardClick(session: SessionDto) {
    if (session.status === 'planned') {
      setConfirmingSession(session);
    } else if (session.status === 'in_progress') {
      void navigate(ROUTES.SESSION_CHAT(session.id));
    } else {
      void navigate(ROUTES.SESSION_HISTORY(session.id));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('sessions.title')}
        description={t('sessions.description')}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            {t('sessions.newSession')}
          </Button>
        }
      />

      <SessionsTabs value={tab} onChange={setTab} total={total} />

      <SessionsList
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
        hasMore={hasMore}
        onCardClick={handleCardClick}
        onLoadMore={loadMore}
        onNewSession={() => setDialogOpen(true)}
      />

      <StartSessionDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <StartPlannedDialog
        session={confirmingSession}
        onOpenChange={(open) => {
          if (!open) setConfirmingSession(null);
        }}
      />
    </div>
  );
}
