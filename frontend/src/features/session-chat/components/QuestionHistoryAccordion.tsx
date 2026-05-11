import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useQuestionHistory } from '../hooks/useQuestionHistory';

type Props = {
  sessionId: string;
  sessionQuestionId: string;
};

function scoreVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 80) return 'default';
  if (score >= 50) return 'secondary';
  return 'destructive';
}

export function QuestionHistoryAccordion({ sessionId, sessionQuestionId }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isError } = useQuestionHistory(sessionId, sessionQuestionId, {
    enabled: isOpen,
  });

  const items = data?.items ?? [];

  return (
    <TooltipProvider>
      <Accordion className="border rounded-md px-3">
        <AccordionItem value="history" className="border-none">
          <AccordionTrigger
            className="text-xs text-muted-foreground py-2"
            onClick={() => setIsOpen(true)}
          >
            {t('sessionChat.quickHistory.title')}
            {isOpen && items.length > 0 && (
              <span className="ml-1 text-xs">({items.length})</span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            {isLoading && (
              <div className="flex flex-col gap-2 pb-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            )}
            {isError && (
              <p className="text-xs text-destructive pb-2">{t('sessionChat.quickHistory.error')}</p>
            )}
            {!isLoading && !isError && items.length === 0 && (
              <p className="text-xs text-muted-foreground pb-2">{t('sessionChat.quickHistory.empty')}</p>
            )}
            {!isLoading && !isError && items.length > 0 && (
              <div className="grid grid-cols-[1fr_1fr_auto] gap-x-3 gap-y-1.5 pb-2 text-xs">
                {items.map((item) => (
                  <Fragment key={`${item.sessionQuestionId}-${item.createdAt}`}>
                    <Tooltip>
                      <TooltipTrigger className="line-clamp-1 text-left text-muted-foreground cursor-default bg-transparent border-none p-0 text-xs">
                        {item.questionText}
                      </TooltipTrigger>
                      <TooltipContent>{item.questionText}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger className="line-clamp-1 text-left cursor-default bg-transparent border-none p-0 text-xs">
                        {item.answerText}
                      </TooltipTrigger>
                      <TooltipContent>{item.answerText}</TooltipContent>
                    </Tooltip>
                    <Badge variant={scoreVariant(item.score)} className="text-[10px] h-fit">
                      {item.score}
                    </Badge>
                  </Fragment>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </TooltipProvider>
  );
}
