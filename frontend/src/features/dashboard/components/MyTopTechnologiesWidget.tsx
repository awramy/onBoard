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
    ? [...data].sort((a, b) => b.score - a.score).slice(0, 5)
    : [];

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
            {techScores.map(({ id, name, score }) => (
              <li key={id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{name}</span>
                  <span className="ml-2 tabular-nums text-muted-foreground">{score}%</span>
                </div>
                <Progress value={score} className="h-1.5" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
