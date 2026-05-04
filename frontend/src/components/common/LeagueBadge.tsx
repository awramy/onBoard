import { cn } from '@/lib/cn';

export type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

type LeagueBadgeProps = {
  league: League;
  label?: string;
  className?: string;
};

const LEAGUE_STYLES: Record<League, { label: string; bg: string; fg: string }> = {
  bronze: {
    label: 'Bronze',
    bg: 'oklch(0.78 0.10 60)',
    fg: 'oklch(0.22 0.05 60)',
  },
  silver: {
    label: 'Silver',
    bg: 'oklch(0.86 0.02 240)',
    fg: 'oklch(0.22 0.01 240)',
  },
  gold: {
    label: 'Gold',
    bg: 'oklch(0.86 0.13 90)',
    fg: 'oklch(0.22 0.06 90)',
  },
  platinum: {
    label: 'Platinum',
    bg: 'oklch(0.88 0.05 175)',
    fg: 'oklch(0.22 0.04 175)',
  },
  diamond: {
    label: 'Diamond',
    bg: 'oklch(0.86 0.10 220)',
    fg: 'oklch(0.22 0.06 220)',
  },
};

export function LeagueBadge({ league, label, className }: LeagueBadgeProps) {
  const style = LEAGUE_STYLES[league];
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: style.bg, color: style.fg }}
      aria-label={`Лига: ${style.label}`}
    >
      {label ?? style.label}
    </span>
  );
}
