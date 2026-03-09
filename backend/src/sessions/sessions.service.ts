import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { QuestionGeneratorService } from './question-generator.service';
import { localize } from '../common/utils/i18n';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
    private questionGenerator: QuestionGeneratorService,
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
        questions: { include: { answers: true }, orderBy: { order: 'asc' } },
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
}
