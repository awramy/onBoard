import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { UserMenu } from '@/components/layout/UserMenu';

function getRouteTitleKey(pathname: string): string {
  if (pathname.startsWith('/progress/leaderboard')) return 'nav.leaderboard';
  if (pathname.startsWith('/progress')) return 'nav.progress';
  if (pathname.startsWith('/sessions')) return 'nav.sessions';
  if (pathname.startsWith('/profile')) return 'nav.profile';
  return 'nav.dashboard';
}

export function Topbar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <header className="glass sticky top-0 z-20 flex h-14 items-center justify-between px-6">
      <h1 className="font-heading text-lg font-semibold text-foreground">
        {t(getRouteTitleKey(pathname))}
      </h1>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
