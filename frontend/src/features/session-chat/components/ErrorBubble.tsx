import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useChatCallbacks } from '../context';
import type { ChatMeta } from '../types';

type Props = {
  meta: ChatMeta;
};

export function ErrorBubble({ meta }: Props) {
  const { t } = useTranslation();
  const { onRetry } = useChatCallbacks();
  const { errorMessage, retryAnswerText } = meta;

  return (
    <div className="flex flex-col gap-2 max-w-2xl">
      <p className="text-sm text-destructive">{errorMessage}</p>
      {retryAnswerText && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRetry(retryAnswerText)}
          className="self-start"
        >
          {t('sessionChat.errors.retry')}
        </Button>
      )}
    </div>
  );
}
