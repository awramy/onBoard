import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export function AuthLayout() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="glass-accent inline-flex size-7 items-center justify-center rounded-lg text-accent-foreground">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="font-heading text-base font-semibold text-foreground">
            {t('app.name')}
          </span>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
