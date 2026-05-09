import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SendHorizonal, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDraftAnswer } from '../hooks/useDraftAnswer';
import { useChatCallbacks } from '../context';

type Props = {
  sessionId: string;
};

export function ChatComposer({ sessionId }: Props) {
  const { t } = useTranslation();
  const { getDraft, saveDraft } = useDraftAnswer(sessionId);
  const { onSend, onSkip, isRunning } = useChatCallbacks();
  const [value, setValue] = useState(() => getDraft());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    saveDraft(value);
  }, [value, saveDraft]);

  function handleSend() {
    const text = value.trim();
    if (!text || isRunning) return;
    onSend(text);
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t bg-background p-3 flex gap-2 items-end">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('sessionChat.composer.placeholder')}
        disabled={isRunning}
        rows={3}
        className="resize-none flex-1 min-h-[72px]"
      />
      <div className="flex flex-col gap-1.5">
        <Button
          size="icon"
          variant="ghost"
          onClick={onSkip}
          disabled={isRunning}
          title={t('sessionChat.composer.skipTooltip')}
          aria-label={t('sessionChat.composer.skip')}
        >
          <SkipForward className="size-4" />
        </Button>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isRunning || !value.trim()}
          aria-label={t('sessionChat.composer.send')}
        >
          <SendHorizonal className="size-4" />
        </Button>
      </div>
    </div>
  );
}
