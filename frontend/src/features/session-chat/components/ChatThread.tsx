import { useTranslation } from 'react-i18next';
import { AssistantRuntimeProvider, ThreadPrimitive } from '@assistant-ui/react';
import type { AssistantRuntime } from '@assistant-ui/react';
import { ChatAssistantMessage } from './ChatAssistantMessage';
import { ChatUserMessage } from './ChatUserMessage';
import { ChatComposer } from './ChatComposer';
import { TypingIndicator } from './TypingIndicator';
import { ChatCallbacksContext } from '../context';

type Props = {
  runtime: AssistantRuntime;
  mode: 'live' | 'history';
  sessionId: string;
  onRetry: (text: string) => void;
  onSkip: () => void;
  onSend: (text: string) => void;
  isRunning: boolean;
};

export function ChatThread({ runtime, mode, sessionId, onRetry, onSkip, onSend, isRunning }: Props) {
  const { t } = useTranslation();

  return (
    <ChatCallbacksContext.Provider value={{ sessionId, onRetry, onSkip, onSend, isRunning }}>
      <AssistantRuntimeProvider runtime={runtime}>
        <ThreadPrimitive.Root className="flex flex-col h-full">
          <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 p-4 pb-2">
              <ThreadPrimitive.Empty>
                <div className="flex flex-col items-center justify-center h-48 text-center gap-2 text-muted-foreground">
                  <p className="text-sm font-medium">{t('sessionChat.emptyTitle')}</p>
                  <p className="text-xs">{t('sessionChat.emptyDescription')}</p>
                </div>
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages
                components={{
                  UserMessage: ChatUserMessage,
                  AssistantMessage: ChatAssistantMessage,
                }}
              />
              <ThreadPrimitive.If running>
                <TypingIndicator />
              </ThreadPrimitive.If>
              <div />
            </div>
          </ThreadPrimitive.Viewport>
          {mode === 'live' && <ChatComposer sessionId={sessionId} />}
        </ThreadPrimitive.Root>
      </AssistantRuntimeProvider>
    </ChatCallbacksContext.Provider>
  );
}
