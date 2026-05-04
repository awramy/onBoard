import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROUTES } from '@/routes/routes';

export default function RegisterPage() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.registerTitle')}</CardTitle>
        <CardDescription>{t('auth.registerDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.haveAccount')}{' '}
          <Link to={ROUTES.LOGIN} className="underline underline-offset-4 hover:text-foreground">
            {t('auth.login')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
