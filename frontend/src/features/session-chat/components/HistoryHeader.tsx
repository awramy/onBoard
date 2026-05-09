import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { ROUTES } from '@/routes/routes';
import type { SessionDetailDto } from '@/api/generated/schemas';

type Props = {
  session: SessionDetailDto;
};

function computeAvgScore(session: SessionDetailDto): number | null {
  const scores = session.questions
    .flatMap((q) => q.answers)
    .map((a) => a.score);
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function HistoryHeader({ session }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const avgScore = computeAvgScore(session);
  const { technologyLevel } = session;

  return (
    <div className="border-b px-4 py-3 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void navigate(ROUTES.SESSIONS)}
        aria-label="Back"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {t('sessionChat.history.title')} — {technologyLevel.technology.name}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{technologyLevel.difficulty}</p>
      </div>
      {avgScore != null && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t('sessionChat.summary.avgScore', { score: avgScore })}</span>
          <ScoreBadge score={avgScore} />
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => void navigate(ROUTES.SESSIONS)}
      >
        {t('sessionChat.history.newSessionCta')}
      </Button>
    </div>
  );
}
