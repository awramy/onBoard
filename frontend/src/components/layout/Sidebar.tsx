import {
  LayoutDashboard,
  ListChecks,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ROUTES } from '@/routes/routes';

type NavItem = {
  to: string;
  icon: LucideIcon;
  labelKey: string;
  end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, labelKey: 'nav.dashboard', end: true },
  { to: ROUTES.SESSIONS, icon: ListChecks, labelKey: 'nav.sessions' },
  { to: ROUTES.PROGRESS, icon: TrendingUp, labelKey: 'nav.progress' },
  { to: ROUTES.PROFILE, icon: UserIcon, labelKey: 'nav.profile' },
];

function NavItemLink({
  to,
  icon: Icon,
  labelKey,
  end,
  onNavigate,
}: NavItem & { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group/nav relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground',
          isActive && 'glass-accent text-accent-foreground hover:bg-accent/60',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden
          />
          <Icon className="size-4 shrink-0" aria-hidden />
          <span>{t(labelKey)}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2 px-2 py-1">
        <span className="glass-accent inline-flex size-7 items-center justify-center rounded-lg text-accent-foreground">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <span className="font-heading text-base font-semibold text-foreground">
          {t('app.name')}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItemLink key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside
        aria-label="Primary navigation"
        className="glass fixed inset-y-0 left-0 z-30 hidden w-60 flex-col rounded-none lg:flex"
      >
        <SidebarContent />
      </aside>
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open navigation"
                className="fixed left-3 top-3 z-30"
              >
                <LayoutDashboard className="size-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
