import { Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/common/EmptyState';

type WipPageProps = {
  titleKey?: string;
  descriptionKey?: string;
};

export function WipPage({
  titleKey = 'common.comingSoon',
  descriptionKey = 'common.wipDescription',
}: WipPageProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-16">
      <EmptyState
        icon={Construction}
        title={t(titleKey)}
        description={t(descriptionKey)}
        className="max-w-md"
      />
    </div>
  );
}
