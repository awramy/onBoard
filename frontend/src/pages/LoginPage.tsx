import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  function loginAsDev() {
    setAuth({
      token: 'dev-stub',
      user: { id: 'dev', username: 'dev', email: 'dev@onboard.local' },
    });
    void navigate(ROUTES.DASHBOARD);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.loginTitle')}</CardTitle>
        <CardDescription>{t('auth.loginDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={loginAsDev} className="w-full">
          {t('auth.loginAsDev')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to={ROUTES.REGISTER} className="underline underline-offset-4 hover:text-foreground">
            {t('auth.register')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
