import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type SessionTab = 'active' | 'all';

type Props = {
  value: SessionTab;
  onChange: (tab: SessionTab) => void;
  total?: number;
};

export function SessionsTabs({ value, onChange, total }: Props) {
  const { t } = useTranslation();

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as SessionTab)}>
      <TabsList>
        <TabsTrigger
          value="active"
          className="data-active:!bg-accent data-active:text-accent-foreground"
        >
          {t('sessions.tabs.active')}
          {value === 'active' && total != null && (
            <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-xs font-medium">
              {total}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="all"
          className="data-active:!bg-accent data-active:text-accent-foreground"
        >
          {t('sessions.tabs.all')}
          {value === 'all' && total != null && (
            <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-xs font-medium">
              {total}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
