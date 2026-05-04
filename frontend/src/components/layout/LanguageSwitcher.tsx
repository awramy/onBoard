import { Check, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANGS = [
  { code: 'ru', labelKey: 'language.ru' },
  { code: 'en', labelKey: 'language.en' },
] as const;

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'ru';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t('language.title')}>
            <Languages />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('language.title')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LANGS.map((lng) => (
            <DropdownMenuItem
              key={lng.code}
              onClick={() => void i18n.changeLanguage(lng.code)}
            >
              <span className="flex flex-1 items-center gap-2">
                <span className="text-xs uppercase text-muted-foreground">
                  {lng.code}
                </span>
                <span>{t(lng.labelKey)}</span>
              </span>
              {current === lng.code ? <Check className="size-4" aria-hidden /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
