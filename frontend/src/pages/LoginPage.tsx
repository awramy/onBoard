import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { ROUTES } from '@/routes/routes';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.loginTitle')}</CardTitle>
        <CardDescription>{t('auth.loginDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link
            to={ROUTES.REGISTER}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {t('auth.register')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
