import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/routes';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={Compass}
        title={t('errors.notFoundTitle')}
        description={t('errors.notFoundDescription')}
        action={
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>{t('errors.goHome')}</Button>
        }
        className="max-w-md"
      />
    </div>
  );
}
