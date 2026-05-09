import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { Markdown } from '@/components/common/Markdown';
import type { ChatMeta } from '../types';

type Props = {
  text: string;
  meta: ChatMeta;
};

export function EvaluationBubble({ text, meta }: Props) {
  const { t } = useTranslation();
  const { score, recommendations, isFullyClosed } = meta;

  return (
    <div className="flex flex-col gap-2 max-w-2xl">
      <div className="flex flex-wrap gap-1.5 items-center">
        {score != null && <ScoreBadge score={score} />}
        {isFullyClosed && (
          <Badge variant="success" className="text-xs">
            {t('sessionChat.fullyClosed')}
          </Badge>
        )}
      </div>
      {text && <Markdown className="text-sm">{text}</Markdown>}
      {recommendations && recommendations.length > 0 && (
        <Accordion multiple={false}>
          <AccordionItem value="rec">
            <AccordionTrigger className="text-xs py-1">
              {t('sessionChat.recommendations')}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="text-xs space-y-1 list-disc pl-4">
                {recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
