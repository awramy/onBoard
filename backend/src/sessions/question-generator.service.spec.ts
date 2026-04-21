import { QuestionGeneratorService } from './question-generator.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { ProgressService } from '../progress/progress.service';
import type { AiService } from '../ai/ai.service';

const SESSION_ID = '00000000-0000-0000-0000-00000000a001';
const USER_ID = '00000000-0000-0000-0000-00000000a002';
const LEVEL_ID = '00000000-0000-0000-0000-00000000a003';
const QUESTION_ID = '00000000-0000-0000-0000-00000000a004';

function buildService(overrides: {
  prisma?: Partial<PrismaService>;
  progress?: Partial<ProgressService>;
  ai?: Partial<AiService>;
}): QuestionGeneratorService {
  return new QuestionGeneratorService(
    overrides.prisma as PrismaService,
    overrides.progress as ProgressService,
    overrides.ai as AiService,
  );
}

function makeUnansweredQuestion(overrides?: Record<string, unknown>) {
  return {
    id: QUESTION_ID,
    topicId: 'topic-1',
    text: { en: 'What is HTTP?', ru: 'Что такое HTTP?' },
    explanation: { en: 'HTTP is a protocol.', ru: 'HTTP — это протокол.' },
    type: 'theory',
    difficulty: 3,
    isDivide: false,
    ...overrides,
  };
}

function makePrismaMocks(
  options: {
    unanswered?: ReturnType<typeof makeUnansweredQuestion>[];
    lowMastery?: unknown[];
    answers?: {
      answerText: string;
      aiFeedback: string;
      recommendations: string[] | null;
      score: number;
    }[];
    createImpl?: jest.Mock;
  } = {},
) {
  const create =
    options.createImpl ??
    jest.fn((args: { data: Record<string, unknown> }) =>
      Promise.resolve({ ...args.data, id: 'sq-id' }),
    );
  return {
    interviewSessionQuestion: { create },
    interviewAnswer: {
      findMany: jest.fn().mockResolvedValue(options.answers ?? []),
    },
  } as unknown as Partial<PrismaService> & {
    interviewSessionQuestion: { create: jest.Mock };
    interviewAnswer: { findMany: jest.Mock };
  };
}

describe('QuestionGeneratorService.generate', () => {
  it('uses original localized text when user has no progress for question', async () => {
    const prisma = makePrismaMocks();
    const progress = {
      getUnansweredQuestions: jest
        .fn()
        .mockResolvedValue([makeUnansweredQuestion()]),
      getLowestMasteryQuestions: jest.fn().mockResolvedValue([]),
      getQuestionProgress: jest.fn().mockResolvedValue(null),
    };
    const ai = {
      hasProviders: jest.fn().mockReturnValue(true),
      generateQuestionText: jest.fn(),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.generate(
      SESSION_ID,
      USER_ID,
      LEVEL_ID,
      1,
      'en',
    );

    expect(result).toHaveLength(1);
    expect(result[0].questionText).toBe('What is HTTP?');
    expect(ai.generateQuestionText).not.toHaveBeenCalled();
    expect(prisma.interviewAnswer.findMany).not.toHaveBeenCalled();
  });

  it('does not invoke AI when mastery is 0', async () => {
    const prisma = makePrismaMocks();
    const progress = {
      getUnansweredQuestions: jest
        .fn()
        .mockResolvedValue([makeUnansweredQuestion()]),
      getLowestMasteryQuestions: jest.fn().mockResolvedValue([]),
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0 }),
    };
    const ai = {
      hasProviders: jest.fn().mockReturnValue(true),
      generateQuestionText: jest.fn(),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.generate(
      SESSION_ID,
      USER_ID,
      LEVEL_ID,
      1,
      'ru',
    );

    expect(result[0].questionText).toBe('Что такое HTTP?');
    expect(ai.generateQuestionText).not.toHaveBeenCalled();
  });

  it('does not invoke AI when no providers are available', async () => {
    const prisma = makePrismaMocks();
    const progress = {
      getUnansweredQuestions: jest
        .fn()
        .mockResolvedValue([makeUnansweredQuestion()]),
      getLowestMasteryQuestions: jest.fn().mockResolvedValue([]),
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0.4 }),
    };
    const ai = {
      hasProviders: jest.fn().mockReturnValue(false),
      generateQuestionText: jest.fn(),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.generate(
      SESSION_ID,
      USER_ID,
      LEVEL_ID,
      1,
      'en',
    );

    expect(result[0].questionText).toBe('What is HTTP?');
    expect(ai.generateQuestionText).not.toHaveBeenCalled();
  });

  it('invokes AI with history for questions with mastery in (0;1)', async () => {
    const answers = [
      {
        answerText: 'prev answer 1',
        aiFeedback: 'missing nuances',
        recommendations: ['study edge cases', 'compare protocols'],
        score: 45,
      },
    ];
    const prisma = makePrismaMocks({ answers });
    const progress = {
      getUnansweredQuestions: jest
        .fn()
        .mockResolvedValue([makeUnansweredQuestion()]),
      getLowestMasteryQuestions: jest.fn().mockResolvedValue([]),
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0.45 }),
    };
    const ai = {
      hasProviders: jest.fn().mockReturnValue(true),
      generateQuestionText: jest
        .fn()
        .mockResolvedValue('What differentiates HTTP from HTTPS?'),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.generate(
      SESSION_ID,
      USER_ID,
      LEVEL_ID,
      1,
      'en',
      'gemini',
    );

    expect(prisma.interviewAnswer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sessionQuestion: {
            questionId: QUESTION_ID,
            session: { userId: USER_ID },
          },
        }) as Record<string, unknown>,
      }),
    );
    expect(ai.generateQuestionText).toHaveBeenCalledWith(
      expect.objectContaining({
        originalQuestionText: 'What is HTTP?',
        explanation: 'HTTP is a protocol.',
        currentMastery: 0.45,
        locale: 'en',
        previousAnswers: [
          expect.objectContaining({
            text: 'prev answer 1',
            feedback: 'missing nuances',
            score: 45,
            recommendations: ['study edge cases', 'compare protocols'],
          }) as unknown,
        ],
      }),
      'gemini',
    );
    expect(result[0].questionText).toBe('What differentiates HTTP from HTTPS?');
  });

  it('falls back to original text when AI throws', async () => {
    const prisma = makePrismaMocks({
      answers: [
        {
          answerText: 'prev',
          aiFeedback: 'ok',
          recommendations: [],
          score: 30,
        },
      ],
    });
    const progress = {
      getUnansweredQuestions: jest
        .fn()
        .mockResolvedValue([makeUnansweredQuestion()]),
      getLowestMasteryQuestions: jest.fn().mockResolvedValue([]),
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0.3 }),
    };
    const ai = {
      hasProviders: jest.fn().mockReturnValue(true),
      generateQuestionText: jest.fn().mockRejectedValue(new Error('boom')),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.generate(
      SESSION_ID,
      USER_ID,
      LEVEL_ID,
      1,
      'en',
    );

    expect(ai.generateQuestionText).toHaveBeenCalledTimes(1);
    expect(result[0].questionText).toBe('What is HTTP?');
  });

  it('falls back to original text when no answer history exists', async () => {
    const prisma = makePrismaMocks({ answers: [] });
    const progress = {
      getUnansweredQuestions: jest
        .fn()
        .mockResolvedValue([makeUnansweredQuestion()]),
      getLowestMasteryQuestions: jest.fn().mockResolvedValue([]),
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0.4 }),
    };
    const ai = {
      hasProviders: jest.fn().mockReturnValue(true),
      generateQuestionText: jest.fn(),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.generate(
      SESSION_ID,
      USER_ID,
      LEVEL_ID,
      1,
      'en',
    );

    expect(ai.generateQuestionText).not.toHaveBeenCalled();
    expect(result[0].questionText).toBe('What is HTTP?');
  });

  it('falls back to original text when AI returns empty string', async () => {
    const prisma = makePrismaMocks({
      answers: [
        {
          answerText: 'x',
          aiFeedback: 'x',
          recommendations: null,
          score: 20,
        },
      ],
    });
    const progress = {
      getUnansweredQuestions: jest
        .fn()
        .mockResolvedValue([makeUnansweredQuestion()]),
      getLowestMasteryQuestions: jest.fn().mockResolvedValue([]),
      getQuestionProgress: jest.fn().mockResolvedValue({ mastery: 0.5 }),
    };
    const ai = {
      hasProviders: jest.fn().mockReturnValue(true),
      generateQuestionText: jest.fn().mockResolvedValue('   '),
    };

    const service = buildService({ prisma, progress, ai });
    const result = await service.generate(
      SESSION_ID,
      USER_ID,
      LEVEL_ID,
      1,
      'en',
    );

    expect(result[0].questionText).toBe('What is HTTP?');
  });
});
