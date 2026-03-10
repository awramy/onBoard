import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { QuestionGeneratorService } from './question-generator.service';
import { AiService } from '../ai/ai.service';
import { localize } from '../common/utils/i18n';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
    private questionGenerator: QuestionGeneratorService,
    private aiService: AiService,
  ) {}

  // AI-NOTE: Создаёт новую сессию со статусом "planned" и конфигом
  async create(
    userId: string,
    technologyLevelId: string,
    config: Record<string, any>,
  ) {
    return this.prisma.interviewSession.create({
      data: {
        userId,
        technologyLevelId,
        config,
        status: 'planned',
        totalQuestions: (config.questions_count as number) || 10,
      },
    });
  }

  // AI-NOTE: Список всех сессий пользователя с локализацией описания технологии
  async findAll(userId: string, locale: string, skip = 0, take = 50) {
    const sessions = await this.prisma.interviewSession.findMany({
      where: { userId },
      include: { technologyLevel: { include: { technology: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    return sessions.map((s) => ({
      ...s,
      technologyLevel: {
        ...s.technologyLevel,
        technology: {
          ...s.technologyLevel.technology,
          description: localize(
            s.technologyLevel.technology.description,
            locale,
          ),
        },
      },
    }));
  }

  // AI-NOTE: Детали сессии с вопросами и ответами, проверяет принадлежность пользователю
  async findOne(id: string, userId: string, locale: string) {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id, userId },
      include: {
        technologyLevel: { include: { technology: true } },
        questions: {
          include: { answers: { orderBy: { createdAt: 'asc' } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    return {
      ...session,
      technologyLevel: {
        ...session.technologyLevel,
        technology: {
          ...session.technologyLevel.technology,
          description: localize(
            session.technologyLevel.technology.description,
            locale,
          ),
        },
      },
      questions: session.questions.map((q) => ({
        ...q,
      })),
    };
  }

  // AI-NOTE: Запуск сессии — генерирует вопросы, переводит в in_progress, возвращает первый вопрос
  async start(sessionId: string, userId: string, locale: string = 'en') {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId)
      throw new ForbiddenException('Not your session');
    if (session.status !== 'planned')
      throw new BadRequestException(
        `Cannot start session with status "${session.status}"`,
      );

    const questions = await this.questionGenerator.generate(
      sessionId,
      userId,
      session.technologyLevelId,
      session.totalQuestions ?? 10,
      locale,
    );

    const updated = await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
        currentOrder: 1,
        totalQuestions: questions.length,
      },
      include: {
        technologyLevel: { include: { technology: true } },
      },
    });

    return {
      ...updated,
      technologyLevel: {
        ...updated.technologyLevel,
        technology: {
          ...updated.technologyLevel.technology,
          description: localize(
            updated.technologyLevel.technology.description,
            locale,
          ),
        },
      },
      totalQuestions: questions.length,
      currentQuestion: questions[0] ?? null,
    };
  }

  // AI-NOTE: Возвращает текущий вопрос сессии по currentOrder
  async getCurrentQuestion(sessionId: string, userId: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId)
      throw new ForbiddenException('Not your session');
    if (session.status !== 'in_progress')
      throw new BadRequestException('Session is not in progress');

    const question = await this.prisma.interviewSessionQuestion.findFirst({
      where: { sessionId, order: session.currentOrder },
    });

    if (!question) throw new NotFoundException('No question at current order');

    return {
      id: question.id,
      questionId: question.questionId,
      questionText: question.questionText,
      difficulty: question.difficulty,
      order: question.order,
      totalQuestions: session.totalQuestions,
    };
  }

  // AI-NOTE: Пропуск вопроса — записывает score=0, пересчитывает прогресс, автозавершает сессию
  async skip(sessionId: string, userId: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId)
      throw new ForbiddenException('Not your session');
    if (session.status !== 'in_progress')
      throw new BadRequestException('Session is not in progress');

    const currentQuestion =
      await this.prisma.interviewSessionQuestion.findFirst({
        where: { sessionId, order: session.currentOrder },
      });

    if (!currentQuestion)
      throw new NotFoundException('No question at current order');

    if (currentQuestion.questionId) {
      await this.progressService.updateQuestionProgress(
        userId,
        currentQuestion.questionId,
        0,
      );

      const question = await this.prisma.question.findUnique({
        where: { id: currentQuestion.questionId },
      });
      if (question) {
        await this.progressService.recalcTopicProgress(
          userId,
          question.topicId,
        );
      }
    }

    const newOrder = session.currentOrder + 1;
    const isFinished = newOrder > (session.totalQuestions ?? 0);

    const updated = await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        currentOrder: newOrder,
        ...(isFinished && {
          status: 'completed',
          finishedAt: new Date(),
        }),
      },
    });

    return {
      skipped: true,
      currentOrder: updated.currentOrder,
      status: updated.status,
      isFinished,
    };
  }

  async answer(sessionId: string, userId: string, answerText: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId)
      throw new ForbiddenException('Not your session');
    if (session.status !== 'in_progress')
      throw new BadRequestException('Session is not in progress');

    const sessionQuestion =
      await this.prisma.interviewSessionQuestion.findFirst({
        where: { sessionId, order: session.currentOrder },
        include: { answers: { orderBy: { createdAt: 'asc' } } },
      });

    if (!sessionQuestion)
      throw new NotFoundException('No question at current order');

    const originalQuestion = sessionQuestion.questionId
      ? await this.prisma.question.findUnique({
          where: { id: sessionQuestion.questionId },
        })
      : null;

    const isDivide = originalQuestion?.isDivide ?? false;
    const explanation = originalQuestion?.explanation
      ? (localize(originalQuestion.explanation, 'en') ?? '')
      : '';

    const previousAnswers: { text: string; feedback: string; score: number }[] =
      isDivide
        ? sessionQuestion.answers.map((a) => ({
            text: a.answerText,
            feedback: typeof a.aiFeedback === 'string' ? a.aiFeedback : '',
            score: a.score,
          }))
        : [];

    const currentProgress = sessionQuestion.questionId
      ? await this.progressService.getQuestionProgress(
          userId,
          sessionQuestion.questionId,
        )
      : null;

    const currentMastery = currentProgress?.mastery ?? 0;

    const sessionConfig = session.config as Record<string, unknown>;
    const modelName = (sessionConfig?.model as string) ?? 'auto';

    const evaluation = await this.aiService.evaluateAnswer(
      {
        questionText: sessionQuestion.questionText,
        questionExplanation: explanation,
        answerText,
        previousAnswers,
        isDivide,
        currentMastery,
      },
      modelName,
    );

    const interviewAnswer = await this.prisma.interviewAnswer.create({
      data: {
        sessionQuestionId: sessionQuestion.id,
        answerText,
        aiFeedback: evaluation.feedback,
        score: evaluation.score,
      },
    });

    if (sessionQuestion.questionId) {
      await this.progressService.updateQuestionProgress(
        userId,
        sessionQuestion.questionId,
        evaluation.score,
      );

      if (evaluation.isFullyClosed) {
        await this.prisma.userQuestionProgress.update({
          where: {
            userId_questionId: {
              userId,
              questionId: sessionQuestion.questionId,
            },
          },
          data: { mastery: 1.0 },
        });
      }

      if (originalQuestion) {
        await this.progressService.recalcTopicProgress(
          userId,
          originalQuestion.topicId,
        );
      }
    }

    const newOrder = session.currentOrder + 1;
    const isFinished = newOrder > (session.totalQuestions ?? 0);

    const updated = await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        currentOrder: newOrder,
        ...(isFinished && {
          status: 'completed',
          finishedAt: new Date(),
        }),
      },
    });

    let nextQuestion: {
      id: string;
      questionText: string;
      difficulty: number;
      order: number;
    } | null = null;

    if (!isFinished) {
      const next = await this.prisma.interviewSessionQuestion.findFirst({
        where: { sessionId, order: newOrder },
      });
      if (next) {
        nextQuestion = {
          id: next.id,
          questionText: next.questionText,
          difficulty: next.difficulty,
          order: next.order,
        };
      }
    }

    this.logger.debug(
      `Answer evaluated: session=${sessionId} question=${sessionQuestion.id} score=${evaluation.score}`,
    );

    return {
      answerId: interviewAnswer.id,
      score: evaluation.score,
      feedback: evaluation.feedback,
      isFullyClosed: evaluation.isFullyClosed,
      recommendations: evaluation.recommendations,
      currentOrder: updated.currentOrder,
      status: updated.status,
      isFinished,
      nextQuestion,
    };
  }
}
