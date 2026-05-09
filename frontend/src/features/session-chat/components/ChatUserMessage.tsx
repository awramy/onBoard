import { useMessage } from '@assistant-ui/react';

export function ChatUserMessage() {
  const content = useMessage((m) => m.content);
  const text = content[0]?.type === 'text' ? content[0].text : '';

  return (
    <div className="flex justify-end">
      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[75%] text-sm whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}
