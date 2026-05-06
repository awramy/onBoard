import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SessionDto } from '@/api/generated/schemas';
import { SessionStatusBadge } from './SessionStatusBadge';

type Props = {
  session: SessionDto;
  onClick: (session: SessionDto) => void;
};

export function SessionCard({ session, onClick }: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'ru' ? ru : enUS;

  const progress =
    session.totalQuestions != null
      ? `${session.currentOrder} / ${session.totalQuestions}`
      : `${session.currentOrder} / ?`;

  const timeAgo = formatDistanceToNow(new Date(session.createdAt), {
    locale,
    addSuffix: true,
  });

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/40"
      onClick={() => onClick(session)}
    >
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {session.technologyLevel.technology.name}
            </span>
            <Badge variant="outline" className="capitalize">
              {session.technologyLevel.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {progress} &middot; {timeAgo}
          </p>
        </div>
        <SessionStatusBadge status={session.status} />
      </CardContent>
    </Card>
  );
}
