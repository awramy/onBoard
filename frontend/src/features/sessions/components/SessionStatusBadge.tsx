import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { SessionDtoStatus } from '@/api/generated/schemas';

type Props = { status: SessionDtoStatus };

const STATUS_STYLES: Record<SessionDtoStatus, string> = {
  planned: 'border-border bg-transparent text-muted-foreground',
  in_progress: '',
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  abandoned: 'border-border bg-transparent text-muted-foreground',
};

export function SessionStatusBadge({ status }: Props) {
  const { t } = useTranslation();

  const isDefault = status === 'in_progress';

  return (
    <Badge
      variant={isDefault ? 'default' : 'outline'}
      className={STATUS_STYLES[status]}
    >
      {t(`sessions.status.${status}`)}
    </Badge>
  );
}
