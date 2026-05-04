import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'glass flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="glass-accent inline-flex size-12 items-center justify-center rounded-full text-accent-foreground">
          <Icon className="size-6" aria-hidden />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="font-heading text-base font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
