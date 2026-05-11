import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { localize } from '../common/utils/i18n';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullScore: true,
        league: true,
        createdAt: true,
      },
    });
  }

  async findAll(skip: number, take: number) {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullScore: true,
        league: true,
      },
      orderBy: { fullScore: 'desc' },
      skip,
      take,
    });
  }

  async getAggregatedProgress(userId: string, locale: string) {
    // Прогресс пользователя по топикам
    const topicProgress = await this.prisma.userTopicProgress.findMany({
      where: { userId },
      include: {
        topic: {
          include: {
            technologyLevels: { select: { technologyLevelId: true } },
          },
        },
      },
    });

    if (topicProgress.length === 0) return [];

    // Карта topicId → score для быстрого доступа
    const progressByTopicId = new Map(
      topicProgress.map((tp) => [tp.topicId, tp.score]),
    );

    // Уникальные id уровней, затронутых прогрессом пользователя
    const levelIds = new Set<string>();
    for (const tp of topicProgress) {
      for (const tlt of tp.topic.technologyLevels) {
        levelIds.add(tlt.technologyLevelId);
      }
    }

    // Загружаем уровни с ПОЛНЫМ списком топиков — чтобы знаменатель был верным
    const levelsWithAllTopics = await this.prisma.technologyLevel.findMany({
      where: { id: { in: Array.from(levelIds) } },
      include: {
        technology: true,
        topics: {
          include: { topic: { select: { id: true, name: true } } },
        },
      },
    });

    // Группируем по технологии
    const byTechnology = new Map<
      string,
      {
        id: string;
        name: string;
        levels: {
          id: string;
          difficulty: string;
          score: number;
          topics: { id: string; name: string | null; score: number }[];
        }[];
      }
    >();

    for (const level of levelsWithAllTopics) {
      const tech = level.technology;

      if (!byTechnology.has(tech.id)) {
        byTechnology.set(tech.id, { id: tech.id, name: tech.name, levels: [] });
      }

      const topicList = level.topics.map((tlt) => ({
        id: tlt.topic.id,
        name: localize(tlt.topic.name, locale),
        score: progressByTopicId.get(tlt.topicId) ?? 0,
      }));

      const levelScore =
        topicList.length > 0
          ? Math.round(
              topicList.reduce((sum, t) => sum + t.score, 0) / topicList.length,
            )
          : 0;

      byTechnology.get(tech.id)!.levels.push({
        id: level.id,
        difficulty: level.difficulty,
        score: levelScore,
        topics: topicList,
      });
    }

    return Array.from(byTechnology.values()).map((tech) => {
      const techScore =
        tech.levels.length > 0
          ? Math.round(
              tech.levels.reduce((sum, l) => sum + l.score, 0) /
                tech.levels.length,
            )
          : 0;
      return {
        id: tech.id,
        name: tech.name,
        score: techScore,
        levels: tech.levels,
      };
    });
  }

  async getTopicProgress(
    userId: string,
    technologyLevelId: string,
    locale: string,
  ) {
    const levelTopics = await this.prisma.technologyLevelTopic.findMany({
      where: { technologyLevelId },
      include: { topic: true },
    });

    const topicIds = levelTopics.map((lt) => lt.topicId);

    const progress = await this.prisma.userTopicProgress.findMany({
      where: { userId, topicId: { in: topicIds } },
    });

    const progressMap = new Map(progress.map((p) => [p.topicId, p]));

    return levelTopics.map((lt) => {
      const p = progressMap.get(lt.topicId);
      return {
        topicId: lt.topic.id,
        topicName: localize(lt.topic.name, locale),
        score: p?.score ?? 0,
        lastUpdated: p?.lastUpdated ?? null,
      };
    });
  }

  async getQuestionProgress(
    userId: string,
    topicId: string,
    locale: string,
    skip: number,
    take: number,
  ) {
    const questions = await this.prisma.question.findMany({
      where: { topicId },
      select: {
        id: true,
        text: true,
        type: true,
        difficulty: true,
      },
      orderBy: { difficulty: 'asc' },
      skip,
      take,
    });

    const questionIds = questions.map((q) => q.id);

    const progress = await this.prisma.userQuestionProgress.findMany({
      where: { userId, questionId: { in: questionIds } },
    });

    const progressMap = new Map(progress.map((p) => [p.questionId, p]));

    return questions.map((q) => {
      const p = progressMap.get(q.id);
      return {
        questionId: q.id,
        text: localize(q.text, locale),
        type: q.type,
        difficulty: q.difficulty,
        attemptsCount: p?.attemptsCount ?? 0,
        lastScore: p?.lastScore ?? null,
        mastery: p?.mastery ?? 0,
        lastAnsweredAt: p?.lastAnsweredAt ?? null,
      };
    });
  }

  // AI-NOTE: Полная история попыток пользователя по одному вопросу — нужна для AI-генерации
  // уточняющего текста (фаза 6) и для отображения истории на фронте.
  // InterviewAnswer связан с User/Question только через InterviewSessionQuestion → InterviewSession.
  async getQuestionAnswerHistory(
    userId: string,
    questionId: string,
    locale: string,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        text: true,
        type: true,
        difficulty: true,
        isDivide: true,
        topicId: true,
      },
    });
    if (!question) throw new NotFoundException('Question not found');

    const progress = await this.prisma.userQuestionProgress.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    const answers = await this.prisma.interviewAnswer.findMany({
      where: {
        sessionQuestion: {
          questionId,
          session: { userId },
        },
      },
      include: {
        sessionQuestion: {
          select: {
            id: true,
            sessionId: true,
            questionText: true,
            order: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      question: {
        id: question.id,
        text: localize(question.text, locale),
        type: question.type,
        difficulty: question.difficulty,
        isDivide: question.isDivide ?? false,
      },
      progress: progress
        ? {
            attemptsCount: progress.attemptsCount,
            totalScore: progress.totalScore,
            lastScore: progress.lastScore,
            mastery: progress.mastery,
            lastAnsweredAt: progress.lastAnsweredAt,
          }
        : null,
      attempts: answers.map((a) => ({
        answerId: a.id,
        sessionId: a.sessionQuestion.sessionId,
        sessionQuestionId: a.sessionQuestion.id,
        order: a.sessionQuestion.order,
        questionText: a.sessionQuestion.questionText,
        answerText: a.answerText,
        feedback: a.aiFeedback,
        recommendations: Array.isArray(a.recommendations)
          ? (a.recommendations as string[])
          : [],
        score: a.score,
        createdAt: a.createdAt,
      })),
    };
  }
}
