import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonList } from '@/components/common/SkeletonList';
import {
  useSessionsControllerFindAll,
  useSessionsControllerFindOne,
} from '@/api/generated/react-query';

export function RecentQuestionsWidget() {
  const { t } = useTranslation();

  const { data: sessions, isLoading: sessionsLoading, isError: sessionsError } =
    useSessionsControllerFindAll({ take: 1 });

  const latestSession = sessions?.[0];

  const { data: sessionDetail, isLoading: detailLoading, isError: detailError } =
    useSessionsControllerFindOne(
      latestSession?.id ?? '',
      {},
      { query: { enabled: !!latestSession?.id } },
    );

  const isLoading = sessionsLoading || (!!latestSession && detailLoading);
  const isError = sessionsError || detailError;

  const recentQuestions = sessionDetail?.questions
    ? [...sessionDetail.questions]
        .sort((a, b) => b.order - a.order)
        .slice(0, 5)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          {t('dashboard.recentQuestions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonList count={5} lineHeight={16} />
        ) : isError ? (
          <Alert variant="destructive">
            <AlertDescription>{t('errors.api.unknown')}</AlertDescription>
          </Alert>
        ) : recentQuestions.length === 0 ? (
          <EmptyState title={t('dashboard.recentQuestions.empty')} />
        ) : (
          <ul className="space-y-2">
            {recentQuestions.map((q) => {
              const lastAnswer = q.answers[q.answers.length - 1];
              return (
                <li key={q.id} className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 flex-1 text-sm">{q.questionText}</p>
                  {lastAnswer != null && <ScoreBadge score={lastAnswer.score} />}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
