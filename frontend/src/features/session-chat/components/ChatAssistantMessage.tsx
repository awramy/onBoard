import { useMessage } from '@assistant-ui/react';
import type { ChatMeta } from '../types';
import { QuestionBubble } from './QuestionBubble';
import { EvaluationBubble } from './EvaluationBubble';
import { ErrorBubble } from './ErrorBubble';

export function ChatAssistantMessage() {
  const meta = useMessage((m) => m.metadata?.custom as ChatMeta | undefined);
  const content = useMessage((m) => m.content);
  const text = content[0]?.type === 'text' ? content[0].text : '';

  if (!meta) return null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        {meta.kind === 'question' && <QuestionBubble text={text} meta={meta} />}
        {meta.kind === 'evaluation' && <EvaluationBubble text={text} meta={meta} />}
        {meta.kind === 'error' && <ErrorBubble meta={meta} />}
      </div>
    </div>
  );
}
