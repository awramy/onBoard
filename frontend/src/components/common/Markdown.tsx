import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/cn';

type MarkdownProps = {
  children: string;
  className?: string;
};

/* Компонент-обертка для md текста (использует библиотечный ReactMarkdown) */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        '[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs',
        '[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4',
        className,
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
