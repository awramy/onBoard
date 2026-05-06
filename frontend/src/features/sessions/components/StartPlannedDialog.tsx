import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SessionDto } from '@/api/generated/schemas';
import { useStartPlannedSession } from '@/features/sessions/hooks/useStartPlannedSession';

type Props = {
  session: SessionDto | null;
  onOpenChange: (open: boolean) => void;
};

export function StartPlannedDialog({ session, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { start, isPending } = useStartPlannedSession();

  const open = session != null;

  async function handleConfirm() {
    if (!session) return;
    await start(session.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('sessions.confirmStart.title')}</DialogTitle>
          <DialogDescription>
            {session &&
              t('sessions.confirmStart.description', {
                tech: session.technologyLevel.technology.name,
                level: session.technologyLevel.difficulty,
                count: session.totalQuestions ?? '?',
              })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('sessions.confirmStart.cancel')}
          </Button>
          <Button onClick={() => void handleConfirm()} disabled={isPending}>
            {isPending
              ? t('sessions.confirmStart.confirming')
              : t('sessions.confirmStart.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
