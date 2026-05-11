import type { ThreadMessageLike } from '@assistant-ui/react';
import type {
  AnswerResultDto,
  CurrentQuestionDto,
  SessionAnswerDto,
  SessionDetailDto,
  SessionQuestionDto,
} from '@/api/generated/schemas';
import type { ChatMeta } from '../types';

function meta(data: ChatMeta): { custom: ChatMeta } {
  return { custom: data };
}

export function makeQuestionMessage(
  q: Pick<CurrentQuestionDto, 'id' | 'questionId' | 'questionText' | 'difficulty' | 'isClarifying' | 'order'>,
  totalQuestions: number | null | undefined,
): ThreadMessageLike {
  return {
    id: `q-${q.id}`,
    role: 'assistant',
    content: [{ type: 'text', text: q.questionText }],
    metadata: meta({
      kind: 'question',
      order: q.order,
      totalQuestions: totalQuestions ?? null,
      difficulty: q.difficulty,
      isClarifying: q.isClarifying,
      sessionQuestionId: q.id,
      questionId: q.questionId ?? null,
    }),
  };
}

export function makeUserMessage(text: string, order: number): ThreadMessageLike {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content: [{ type: 'text', text }],
    metadata: meta({ kind: 'question', order }),
  };
}

export function makeEvaluationMessage(res: AnswerResultDto): ThreadMessageLike {
  return {
    id: `eval-${res.answerId}`,
    role: 'assistant',
    content: [{ type: 'text', text: res.feedback }],
    metadata: meta({
      kind: 'evaluation',
      score: res.score,
      recommendations: res.recommendations,
      isFullyClosed: res.isFullyClosed,
    }),
  };
}

export function makeSkipEvaluationMessage(skipText: string): ThreadMessageLike {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: [{ type: 'text', text: skipText }],
    metadata: meta({ kind: 'evaluation', score: 0, recommendations: [], isFullyClosed: false }),
  };
}

export function makeHistoryEvaluationMessage(ans: SessionAnswerDto): ThreadMessageLike {
  return {
    id: `eval-${ans.id}`,
    role: 'assistant',
    content: [{ type: 'text', text: ans.aiFeedback }],
    metadata: meta({
      kind: 'evaluation',
      score: ans.score,
      recommendations: ans.recommendations,
      isFullyClosed: false,
    }),
  };
}

export function makeErrorMessage(retryAnswerText: string, errorMessage: string): ThreadMessageLike {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: [{ type: 'text', text: errorMessage }],
    metadata: meta({ kind: 'error', retryAnswerText, errorMessage }),
  };
}

function makeQuestionMessageFromDto(
  q: SessionQuestionDto,
  totalQuestions: number | null,
): ThreadMessageLike {
  return {
    id: `q-${q.id}`,
    role: 'assistant',
    content: [{ type: 'text', text: q.questionText }],
    metadata: meta({
      kind: 'question',
      order: q.order,
      totalQuestions,
      difficulty: q.difficulty,
      isClarifying: q.isClarifying,
      sessionQuestionId: q.id,
      questionId: q.questionId ?? null,
    }),
  };
}

export function hydrateFromSession(
  session: SessionDetailDto,
  skipFeedbackText: string,
): ThreadMessageLike[] {
  const messages: ThreadMessageLike[] = [];
  const sorted = [...session.questions].sort(
    (a, b) =>
      a.order - b.order ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  for (const q of sorted) {
    const isSkipped =
      q.answers.length === 0 &&
      (q.order < session.currentOrder ||
        session.status === 'completed' ||
        session.status === 'abandoned');
    const isPending =
      q.answers.length === 0 && !isSkipped;

    if (isPending) continue;

    messages.push(makeQuestionMessageFromDto(q, session.totalQuestions));

    if (isSkipped) {
      messages.push(makeSkipEvaluationMessage(skipFeedbackText));
      continue;
    }

    const sortedAnswers = [...q.answers].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    for (const ans of sortedAnswers) {
      messages.push(makeUserMessage(ans.answerText, q.order));
      messages.push(makeHistoryEvaluationMessage(ans));
    }
  }

  return messages;
}
