import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { loginSchema, type LoginInput } from '@/features/auth/schemas';
import { useLogin } from '@/features/auth/hooks/useLogin';

export function LoginForm() {
  const { t } = useTranslation();
  const { mutate, isPending } = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginInput) => {
    mutate({ data: values });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t('auth.email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              {fieldState.error?.message && (
                <FormMessage>{t(fieldState.error.message)}</FormMessage>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t('auth.password')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              {fieldState.error?.message && (
                <FormMessage>{t(fieldState.error.message)}</FormMessage>
              )}
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t('auth.submitting') : t('auth.submitLogin')}
        </Button>
      </form>
    </Form>
  );
}
