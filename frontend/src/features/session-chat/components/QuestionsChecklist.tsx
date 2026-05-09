import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import type { SessionDetailDto } from '@/api/generated/schemas';

type Props = {
  session: SessionDetailDto;
};

export function QuestionsChecklist({ session }: Props) {
  const { t } = useTranslation();
  const { questions, currentOrder, totalQuestions } = session;
  const total = totalQuestions ?? questions.length;

  const sorted = [...questions].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: total }, (_, i) => {
        const order = i + 1;
        const question = sorted.find((q) => q.order === order);
        const answer = question?.answers[0];
        const isCurrent = order === currentOrder && session.status === 'in_progress';
        const isAnswered = answer != null;
        const isSkipped = question && !isAnswered && order < currentOrder;
        const isPending = !isCurrent && !isAnswered && !isSkipped;

        return (
          <div
            key={order}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
              isCurrent && 'bg-primary/10 text-primary font-medium',
              isPending && 'text-muted-foreground',
            )}
          >
            <span className="shrink-0">
              {isAnswered && (
                <Check className="size-3.5 text-green-500" />
              )}
              {isSkipped && (
                <Circle className="size-3.5 text-muted-foreground/50" />
              )}
              {isCurrent && (
                <ChevronRight className="size-3.5 text-primary" />
              )}
              {isPending && (
                <Clock className="size-3.5 opacity-40" />
              )}
            </span>
            <span className="flex-1 truncate">
              {question?.questionText
                ? question.questionText.slice(0, 60) + (question.questionText.length > 60 ? '…' : '')
                : t('sessionChat.pending')}
            </span>
            {isAnswered && answer && (
              <ScoreBadge score={answer.score} className="text-[10px] px-1 py-0" />
            )}
            {isSkipped && (
              <span className="text-muted-foreground/60 text-[10px]">{t('sessionChat.skipped')}</span>
            )}
            {isCurrent && (
              <span className="text-primary text-[10px]">{t('sessionChat.current')}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
