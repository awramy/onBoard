import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';

type SkeletonListProps = {
  count?: number;
  lineHeight?: number;
  className?: string;
};

export function SkeletonList({
  count = 4,
  lineHeight = 16,
  className,
}: SkeletonListProps) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      role="status"
      aria-busy="true"
      aria-label="Загрузка"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-full rounded-md"
          style={{ height: lineHeight }}
        />
      ))}
    </div>
  );
}
