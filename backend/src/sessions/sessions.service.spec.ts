import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { ProgressService } from '../progress/progress.service';
import type { QuestionGeneratorService } from './question-generator.service';
import type { AiService } from '../ai/ai.service';

function buildService(overrides: {
  prisma?: Partial<PrismaService>;
  progress?: Partial<ProgressService>;
  questionGen?: Partial<QuestionGeneratorService>;
  ai?: Partial<AiService>;
}): SessionsService {
  return new SessionsService(
    overrides.prisma as PrismaService,
    overrides.progress as ProgressService,
    overrides.questionGen as QuestionGeneratorService,
    overrides.ai as AiService,
  );
}

const SESSION_ID = '00000000-0000-0000-0000-000000000001';
const USER_ID = '00000000-0000-0000-0000-000000000002';
const QUESTION_ID = '00000000-0000-0000-0000-000000000003';
const SQ_ID = '00000000-0000-0000-0000-000000000004';
const ANSWER_ID = '00000000-0000-0000-0000-000000000005';

function makeSession(overrides?: Record<string, unknown>) {
  return {
    id: SESSION_ID,
    userId: USER_ID,
    status: 'in_progress',
    currentOrder: 1,
    totalQuestions: 3,
    config: {},
    ...overrides,
  };
}

function makeSessionQuestion(overrides?: Record<string, unknown>) {
  return {
    id: SQ_ID,
    sessionId: SESSION_ID,
    questionId: QUESTION_ID,
    questionText: 'What is HTTP?',
    difficulty: 1,
    order: 1,
    answers: [],
    ...overrides,
  };
}

function makeOriginalQuestion(overrides?: Record<string, unknown>) {
  return {
    id: QUESTION_ID,
    topicId: 'topic-1',
    text: { en: 'What is HTTP?' },
    explanation: { en: 'HTTP is a protocol' },
    isDivide: false,
    difficulty: 1,
    ...overrides,
  };
}

function makeEvaluation(overrides?: Record<string, unknown>) {
  return {
    score: 80,
    feedback: 'Good answer',
    isFullyClosed: false,
    recommendations: ['study caching'],
    ...overrides,
  };
}

describe('SessionsService.answer', () => {
  it('evaluates answer, creates record, advances to next question', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest.fn().mockResolvedValue(makeSession()),
        update: jest.fn().mockResolvedValue(makeSession({ currentOrder: 2 })),
      },
      interviewSessionQuestion: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(makeSessionQuestion())
          .mockResolvedValueOnce({
            id: 'next-sq',
            questionText: 'What is HTTPS?',
            difficulty: 2,
            order: 2,
          }),
      },
      question: {
        findUnique: jest.fn().mockResolvedValue(makeOriginalQuestion()),
      },
      interviewAnswer: {
        create: jest.fn().mockResolvedValue({ id: ANSWER_ID }),
      },
      userQuestionProgress: { update: jest.fn() },
    };
    const progress = {
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0.3 }),
      updateQuestionProgress: jest.fn().mockResolvedValue({}),
      recalcTopicProgress: jest.fn().mockResolvedValue(undefined),
    };
    const ai = {
      evaluateAnswer: jest.fn().mockResolvedValue(makeEvaluation()),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.answer(SESSION_ID, USER_ID, 'My answer');

    expect(ai.evaluateAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        answerText: 'My answer',
        currentMastery: 0.3,
        isDivide: false,
      }),
      'auto',
    );
    expect(prisma.interviewAnswer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sessionQuestionId: SQ_ID,
        answerText: 'My answer',
        score: 80,
      }) as Record<string, unknown>,
    });
    expect(progress.updateQuestionProgress).toHaveBeenCalledWith(
      USER_ID,
      QUESTION_ID,
      80,
    );
    expect(progress.recalcTopicProgress).toHaveBeenCalledWith(
      USER_ID,
      'topic-1',
    );
    expect(result.score).toBe(80);
    expect(result.isFinished).toBe(false);
    expect(result.nextQuestion).toMatchObject({ order: 2 });
  });

  it('sets mastery to 1.0 when AI marks question as fully closed', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest.fn().mockResolvedValue(makeSession()),
        update: jest.fn().mockResolvedValue(makeSession({ currentOrder: 2 })),
      },
      interviewSessionQuestion: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(makeSessionQuestion())
          .mockResolvedValueOnce(null),
      },
      question: {
        findUnique: jest.fn().mockResolvedValue(makeOriginalQuestion()),
      },
      interviewAnswer: {
        create: jest.fn().mockResolvedValue({ id: ANSWER_ID }),
      },
      userQuestionProgress: { update: jest.fn() },
    };
    const progress = {
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0.5 }),
      updateQuestionProgress: jest.fn().mockResolvedValue({}),
      recalcTopicProgress: jest.fn().mockResolvedValue(undefined),
    };
    const ai = {
      evaluateAnswer: jest
        .fn()
        .mockResolvedValue(makeEvaluation({ isFullyClosed: true, score: 95 })),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.answer(SESSION_ID, USER_ID, 'Perfect answer');

    expect(prisma.userQuestionProgress.update).toHaveBeenCalledWith({
      where: {
        userId_questionId: { userId: USER_ID, questionId: QUESTION_ID },
      },
      data: { mastery: 1.0 },
    });
    expect(result.isFullyClosed).toBe(true);
  });

  it('passes previous answers for isDivide questions', async () => {
    const prevAnswers = [{ answerText: 'prev', aiFeedback: 'ok', score: 50 }];
    const prisma = {
      interviewSession: {
        findUnique: jest.fn().mockResolvedValue(makeSession()),
        update: jest.fn().mockResolvedValue(makeSession({ currentOrder: 2 })),
      },
      interviewSessionQuestion: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(makeSessionQuestion({ answers: prevAnswers }))
          .mockResolvedValueOnce(null),
      },
      question: {
        findUnique: jest
          .fn()
          .mockResolvedValue(makeOriginalQuestion({ isDivide: true })),
      },
      interviewAnswer: {
        create: jest.fn().mockResolvedValue({ id: ANSWER_ID }),
      },
      userQuestionProgress: { update: jest.fn() },
    };
    const progress = {
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0.2 }),
      updateQuestionProgress: jest.fn().mockResolvedValue({}),
      recalcTopicProgress: jest.fn().mockResolvedValue(undefined),
    };
    const ai = {
      evaluateAnswer: jest.fn().mockResolvedValue(makeEvaluation()),
    };

    const service = buildService({ prisma, progress, ai });
    await service.answer(SESSION_ID, USER_ID, 'Follow-up answer');

    expect(ai.evaluateAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        isDivide: true,
        previousAnswers: [{ text: 'prev', feedback: 'ok', score: 50 }],
      }),
      'auto',
    );
  });

  it('auto-completes session on last question', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest
          .fn()
          .mockResolvedValue(
            makeSession({ currentOrder: 3, totalQuestions: 3 }),
          ),
        update: jest.fn().mockResolvedValue(
          makeSession({
            currentOrder: 4,
            status: 'completed',
            finishedAt: new Date(),
          }),
        ),
      },
      interviewSessionQuestion: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(makeSessionQuestion({ order: 3 })),
      },
      question: {
        findUnique: jest.fn().mockResolvedValue(makeOriginalQuestion()),
      },
      interviewAnswer: {
        create: jest.fn().mockResolvedValue({ id: ANSWER_ID }),
      },
      userQuestionProgress: { update: jest.fn() },
    };
    const progress = {
      getQuestionProgress: jest.fn().mockResolvedValue(null),
      updateQuestionProgress: jest.fn().mockResolvedValue({}),
      recalcTopicProgress: jest.fn().mockResolvedValue(undefined),
    };
    const ai = {
      evaluateAnswer: jest.fn().mockResolvedValue(makeEvaluation()),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.answer(SESSION_ID, USER_ID, 'Final answer');

    expect(result.isFinished).toBe(true);
    expect(result.status).toBe('completed');
    expect(result.nextQuestion).toBeNull();
  });

  it('uses model name from session config', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest
          .fn()
          .mockResolvedValue(makeSession({ config: { model: 'gpt-4o' } })),
        update: jest.fn().mockResolvedValue(makeSession({ currentOrder: 2 })),
      },
      interviewSessionQuestion: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(makeSessionQuestion())
          .mockResolvedValueOnce(null),
      },
      question: {
        findUnique: jest.fn().mockResolvedValue(makeOriginalQuestion()),
      },
      interviewAnswer: {
        create: jest.fn().mockResolvedValue({ id: ANSWER_ID }),
      },
      userQuestionProgress: { update: jest.fn() },
    };
    const progress = {
      getQuestionProgress: jest.fn().mockResolvedValue(null),
      updateQuestionProgress: jest.fn().mockResolvedValue({}),
      recalcTopicProgress: jest.fn().mockResolvedValue(undefined),
    };
    const ai = {
      evaluateAnswer: jest.fn().mockResolvedValue(makeEvaluation()),
    };

    const service = buildService({ prisma, progress, ai });
    await service.answer(SESSION_ID, USER_ID, 'Answer');

    expect(ai.evaluateAnswer).toHaveBeenCalledWith(expect.anything(), 'gpt-4o');
  });

  it('throws NotFoundException when session not found', async () => {
    const prisma = {
      interviewSession: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const service = buildService({ prisma });
    await expect(service.answer(SESSION_ID, USER_ID, 'x')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ForbiddenException for wrong user', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest
          .fn()
          .mockResolvedValue(makeSession({ userId: 'other-user' })),
      },
    };
    const service = buildService({ prisma });
    await expect(service.answer(SESSION_ID, USER_ID, 'x')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws BadRequestException when session not in progress', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest
          .fn()
          .mockResolvedValue(makeSession({ status: 'completed' })),
      },
    };
    const service = buildService({ prisma });
    await expect(service.answer(SESSION_ID, USER_ID, 'x')).rejects.toThrow(
      BadRequestException,
    );
  });
});
