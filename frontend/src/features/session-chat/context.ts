import { createContext, useContext } from 'react';

type ChatCallbacks = {
  sessionId: string;
  onRetry: (text: string) => void;
  onSkip: () => void;
  onSend: (text: string) => void;
  isRunning: boolean;
};

export const ChatCallbacksContext = createContext<ChatCallbacks>({
  sessionId: '',
  onRetry: () => {},
  onSkip: () => {},
  onSend: () => {},
  isRunning: false,
});

export const useChatCallbacks = () => useContext(ChatCallbacksContext);
