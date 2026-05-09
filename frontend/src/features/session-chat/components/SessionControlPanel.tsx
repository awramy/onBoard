import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { LogOut, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { SessionDetailDto } from '@/api/generated/schemas';
import { QuestionsChecklist } from './QuestionsChecklist';

type Props = {
  session: SessionDetailDto;
  onFinishEarly: () => void;
  onAbandon: () => void;
  isRunning: boolean;
};

export function SessionControlPanel({ session, onFinishEarly, onAbandon, isRunning }: Props) {
  const { t, i18n } = useTranslation();
  const { technologyLevel, currentOrder, totalQuestions, startedAt } = session;

  const answered = Math.max(0, currentOrder - 1);
  const total = totalQuestions ?? 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  const locale = i18n.language === 'ru' ? ru : enUS;
  const startedLabel = startedAt
    ? formatDistanceToNow(new Date(startedAt), { addSuffix: true, locale })
    : '—';

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div>
        <p className="font-semibold text-sm">{technologyLevel.technology.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{technologyLevel.difficulty}</p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('sessionChat.controlPanel.progress', { cur: answered, total })}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>{t('sessionChat.controlPanel.startedAt', { time: startedLabel })}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <QuestionsChecklist session={session} />
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onFinishEarly}
          disabled={isRunning}
          className="w-full gap-1.5"
        >
          <CheckSquare className="size-3.5" />
          {t('sessionChat.controlPanel.finishEarly')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAbandon}
          disabled={isRunning}
          className="w-full gap-1.5 text-destructive hover:text-destructive"
        >
          <LogOut className="size-3.5" />
          {t('sessionChat.controlPanel.abandon')}
        </Button>
      </div>
    </div>
  );
}
