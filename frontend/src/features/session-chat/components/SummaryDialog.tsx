import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/routes/routes';
import type { FinishResultDto } from '@/api/generated/schemas';

type Props = {
  open: boolean;
  result: FinishResultDto;
  sessionId: string;
};

export function SummaryDialog({ open, result, sessionId }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { avgScore, questionsAnswered, totalQuestions, newLeague, sessionScore } = result;

  function goHistory() {
    void navigate(ROUTES.SESSION_HISTORY(sessionId));
  }

  function goNewSession() {
    void navigate(ROUTES.SESSIONS);
  }

  return (
    <Dialog open={open} disablePointerDismissal>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('sessionChat.summary.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {t('sessionChat.summary.avgScore', { score: Math.round(avgScore) })}
            </Badge>
            {sessionScore > 0 && (
              <Badge variant="success" className="text-sm px-3 py-1">
                {t('sessionChat.summary.scoreEarned', { score: sessionScore })}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('sessionChat.summary.answered', { answered: questionsAnswered, total: totalQuestions })}
          </p>
          {newLeague && (
            <p className="text-sm text-muted-foreground">
              {t('sessionChat.summary.league', { league: newLeague })}
            </p>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={goNewSession}>
            {t('sessionChat.summary.newSession')}
          </Button>
          <Button className="flex-1" onClick={goHistory}>
            {t('sessionChat.summary.viewHistory')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
