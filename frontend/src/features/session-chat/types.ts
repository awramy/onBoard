export type ChatMessageKind = 'question' | 'evaluation' | 'error';

export type ChatMeta = {
  kind: ChatMessageKind;
  // question
  order?: number;
  totalQuestions?: number | null;
  difficulty?: number;
  isDivide?: boolean;
  questionId?: string | null;
  // evaluation
  score?: number;
  recommendations?: string[];
  isFullyClosed?: boolean;
  // error
  retryAnswerText?: string;
  errorMessage?: string;
};
