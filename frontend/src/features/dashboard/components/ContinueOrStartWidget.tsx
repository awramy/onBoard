import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SkeletonList } from '@/components/common/SkeletonList';
import { useSessionsControllerFindAll } from '@/api/generated/react-query';
import { ROUTES } from '@/routes/routes';
import { StartSessionDialog } from './StartSessionDialog';

export function ContinueOrStartWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useSessionsControllerFindAll({ take: 50 });

  const activeSession = data?.find((s) => s.status === 'in_progress');

  const progress =
    activeSession && activeSession.totalQuestions
      ? Math.round((activeSession.currentOrder / activeSession.totalQuestions) * 100)
      : 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {activeSession
              ? t('dashboard.continue.title')
              : t('dashboard.start.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonList count={3} lineHeight={20} />
          ) : activeSession ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {activeSession.technologyLevel.technology.name} —{' '}
                {activeSession.technologyLevel.difficulty}
              </p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.continue.progress')}: {activeSession.currentOrder}/
                  {activeSession.totalQuestions}
                </p>
                <Progress value={progress} />
              </div>
              <Button
                className="w-full"
                onClick={() => void navigate(ROUTES.SESSION_CHAT(activeSession.id))}
              >
                <Play className="mr-2 size-4" />
                {t('dashboard.continue.button')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('dashboard.start.subtitle')}</p>
              <Button className="w-full" onClick={() => setDialogOpen(true)}>
                <RotateCcw className="mr-2 size-4" />
                {t('dashboard.start.button')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <StartSessionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
