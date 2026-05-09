import { useTranslation } from 'react-i18next';

export function TypingIndicator() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
        <span className="text-xs text-muted-foreground">{t('sessionChat.thinking')}</span>
      </div>
    </div>
  );
}
