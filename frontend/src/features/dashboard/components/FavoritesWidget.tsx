import { useTranslation } from 'react-i18next';
import { Star, X } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonList } from '@/components/common/SkeletonList';
import { getQuestionsControllerFindOneQueryOptions } from '@/api/generated/react-query';
import { useFavoriteIds } from '@/features/favorites/hooks/useFavoriteIds';
import { useToggleFavorite } from '@/features/favorites/hooks/useToggleFavorite';

export function FavoritesWidget() {
  const { t } = useTranslation();
  const ids = useFavoriteIds();

  const results = useQueries({
    queries: ids.map((id) => getQuestionsControllerFindOneQueryOptions(id, {})),
  });

  const isLoading = results.some((r) => r.isLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="size-4" />
          {t('dashboard.favorites.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonList count={3} lineHeight={16} />
        ) : ids.length === 0 ? (
          <EmptyState icon={Star} title={t('dashboard.favorites.empty')} />
        ) : (
          <ul className="space-y-2">
            {results.map((result, i) => {
              const question = result.data;
              const id = ids[i];
              return (
                <FavoriteRow key={id} id={id} text={question?.text ?? id} difficulty={question?.difficulty} />
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function FavoriteRow({
  id,
  text,
  difficulty,
}: {
  id: string;
  text: string;
  difficulty?: number | null;
}) {
  const { toggle } = useToggleFavorite(id);
  return (
    <li className="flex items-start gap-2">
      <p className="line-clamp-1 flex-1 text-sm">{text}</p>
      {difficulty != null && (
        <span className="shrink-0 text-xs text-muted-foreground">{difficulty}</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-5 shrink-0"
        onClick={toggle}
        aria-label="Удалить из избранного"
      >
        <X className="size-3" />
      </Button>
    </li>
  );
}
