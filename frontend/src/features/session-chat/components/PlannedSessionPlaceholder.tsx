import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useStartPlannedSession } from '@/features/sessions/hooks/useStartPlannedSession';

type Props = {
  sessionId: string;
};

export function PlannedSessionPlaceholder({ sessionId }: Props) {
  const { t } = useTranslation();
  const { start, isPending } = useStartPlannedSession();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <p className="text-lg font-semibold">{t('sessionChat.notStarted.title')}</p>
      <p className="text-sm text-muted-foreground">{t('sessionChat.notStarted.description')}</p>
      <Button onClick={() => void start(sessionId)} disabled={isPending}>
        {isPending ? t('sessionChat.notStarted.starting') : t('sessionChat.notStarted.start')}
      </Button>
    </div>
  );
}
