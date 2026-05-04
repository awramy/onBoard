import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';

type ScoreBadgeProps = {
  score: number;
  className?: string;
};

function variantForScore(score: number) {
  if (score >= 70) return 'success' as const;
  if (score >= 40) return 'warning' as const;
  return 'destructive' as const;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const rounded = Math.round(score);
  return (
    <Badge
      variant={variantForScore(rounded)}
      className={cn('tabular-nums', className)}
    >
      {rounded}
    </Badge>
  );
}
