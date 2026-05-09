import { AxiosError } from 'axios';
import { i18n } from '@/i18n';

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.code === 'ERR_NETWORK') return i18n.t('errors.api.offline');

    const status = error.response?.status;
    const serverMessage = error.response?.data?.message as string | undefined;

    if (status === 401) return i18n.t('errors.api.sessionExpired');
    if (status === 403) return i18n.t('errors.api.unknown');
    if (status === 409) return i18n.t('errors.api.emailTaken');
    if (status === 400) {
      return serverMessage ?? i18n.t('errors.api.badRequest');
    }
    if (serverMessage) return serverMessage;
  }

  return i18n.t('errors.api.unknown');
}
