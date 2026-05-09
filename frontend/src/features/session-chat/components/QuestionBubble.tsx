import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { ChatMeta } from '../types';

type Props = {
  text: string;
  meta: ChatMeta;
};

export function QuestionBubble({ text, meta }: Props) {
  const { t } = useTranslation();
  const { order, totalQuestions, difficulty, isDivide } = meta;

  return (
    <div className="flex flex-col gap-2 max-w-2xl">
      <div className="flex flex-wrap gap-1.5 items-center">
        {order != null && (
          <Badge variant="outline" className="text-xs">
            {t('sessionChat.questionLabel', { order, total: totalQuestions ?? '?' })}
          </Badge>
        )}
        {difficulty != null && (
          <Badge variant="secondary" className="text-xs">
            {t('sessionChat.difficultyLabel', { value: difficulty })}
          </Badge>
        )}
        {isDivide && (
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
            {t('sessionChat.isDivideHint')}
          </Badge>
        )}
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}
