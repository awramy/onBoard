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
import { registerSchema, type RegisterInput } from '@/features/auth/schemas';
import { useRegister } from '@/features/auth/hooks/useRegister';

export function RegisterForm() {
  const { t } = useTranslation();
  const { mutate, isPending } = useRegister();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', username: '' },
  });

  const onSubmit = (values: RegisterInput) => {
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
          name="username"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t('auth.username')}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={t('auth.usernamePlaceholder')}
                  autoComplete="username"
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
                  autoComplete="new-password"
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
          {isPending ? t('auth.submitting') : t('auth.submitRegister')}
        </Button>
      </form>
    </Form>
  );
}
