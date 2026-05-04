import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('gap-2', className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="font-heading text-2xl font-semibold leading-tight text-primary">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className="glass-accent inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-accent-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
