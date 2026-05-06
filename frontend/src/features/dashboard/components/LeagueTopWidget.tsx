import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { LeagueBadge } from '@/components/common/LeagueBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonList } from '@/components/common/SkeletonList';
import {
  useUsersControllerGetProfile,
  useUsersControllerFindAll,
} from '@/api/generated/react-query';
import type { League } from '@/components/common/LeagueBadge';

export function LeagueTopWidget() {
  const { t } = useTranslation();

  const { data: me, isLoading: meLoading, isError: meError } =
    useUsersControllerGetProfile();

  const { data: allUsers, isLoading: usersLoading, isError: usersError } =
    useUsersControllerFindAll({ take: 50 });

  const isLoading = meLoading || usersLoading;
  const isError = meError || usersError;

  const league = me?.league ?? 'bronze';

  const leagueTop = allUsers
    ? allUsers.filter((u) => u.league === league).slice(0, 5)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-4" />
          {t('dashboard.leagueTop.title')}
          {me && (
            <LeagueBadge league={league as League} className="ml-1" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonList count={5} lineHeight={36} />
        ) : isError ? (
          <Alert variant="destructive">
            <AlertDescription>{t('errors.api.unknown')}</AlertDescription>
          </Alert>
        ) : leagueTop.length === 0 ? (
          <EmptyState title={t('dashboard.leagueTop.empty')} />
        ) : (
          <ul className="space-y-2">
            {leagueTop.map((user) => (
              <li key={user.id} className="flex items-center gap-2">
                <UserAvatar username={user.username} size="sm" />
                <span className="flex-1 truncate text-sm">{user.username}</span>
                {user.id === me?.id && (
                  <Badge variant="outline" className="text-xs">
                    {t('dashboard.leagueTop.you')}
                  </Badge>
                )}
                <ScoreBadge score={user.fullScore} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
