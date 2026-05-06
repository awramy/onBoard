import { useTranslation } from 'react-i18next';
import { MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonList } from '@/components/common/SkeletonList';
import type { SessionDto } from '@/api/generated/schemas';
import { SessionCard } from './SessionCard';

type Props = {
  items: SessionDto[];
  isLoading: boolean;
  isFetching: boolean;
  hasMore: boolean;
  onCardClick: (session: SessionDto) => void;
  onLoadMore: () => void;
  onNewSession: () => void;
};

export function SessionsList({
  items,
  isLoading,
  isFetching,
  hasMore,
  onCardClick,
  onLoadMore,
  onNewSession,
}: Props) {
  const { t } = useTranslation();

  if (isLoading) {
    return <SkeletonList count={5} lineHeight={72} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title={t('sessions.empty.title')}
        description={t('sessions.empty.description')}
        action={
          <Button onClick={onNewSession}>{t('sessions.empty.cta')}</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((session) => (
        <SessionCard key={session.id} session={session} onClick={onCardClick} />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onLoadMore} disabled={isFetching}>
            {t('sessions.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
