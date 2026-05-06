import { useTranslation } from 'react-i18next';
import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonList } from '@/components/common/SkeletonList';
import { useUsersControllerGetProgress } from '@/api/generated/react-query';

export function MyTopTechnologiesWidget() {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useUsersControllerGetProgress({});

  const techScores = data
    ? data
        .map((tech) => ({
          id: tech.id,
          name: tech.name,
          score: tech.levels.reduce(
            (sum, level) => sum + level.topics.reduce((s, topic) => s + topic.score, 0),
            0,
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    : [];

  const maxScore = techScores[0]?.score ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="size-4" />
          {t('dashboard.topTechnologies.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonList count={5} lineHeight={36} />
        ) : isError ? (
          <Alert variant="destructive">
            <AlertDescription>{t('errors.api.unknown')}</AlertDescription>
          </Alert>
        ) : techScores.length === 0 ? (
          <EmptyState title={t('dashboard.topTechnologies.empty')} />
        ) : (
          <ul className="space-y-3">
            {techScores.map(({ id, name, score }) => {
              const pct = Math.round((score / maxScore) * 100);
              return (
                <li key={id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{name}</span>
                    <span className="ml-2 tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
