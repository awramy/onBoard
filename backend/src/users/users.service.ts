import { Injectable } from '@nestjs/common';
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
    const topicProgress = await this.prisma.userTopicProgress.findMany({
      where: { userId },
      include: {
        topic: {
          include: {
            technologyLevels: {
              include: {
                technologyLevel: {
                  include: { technology: true },
                },
              },
            },
          },
        },
      },
    });

    const byTechnology = new Map<
      string,
      {
        id: string;
        name: string;
        levels: Map<
          string,
          {
            id: string;
            difficulty: string;
            topics: {
              id: string;
              name: string | null;
              score: number;
            }[];
          }
        >;
      }
    >();

    for (const tp of topicProgress) {
      for (const tlt of tp.topic.technologyLevels) {
        const tech = tlt.technologyLevel.technology;
        const level = tlt.technologyLevel;

        if (!byTechnology.has(tech.id)) {
          byTechnology.set(tech.id, {
            id: tech.id,
            name: tech.name,
            levels: new Map(),
          });
        }
        const techEntry = byTechnology.get(tech.id)!;

        if (!techEntry.levels.has(level.id)) {
          techEntry.levels.set(level.id, {
            id: level.id,
            difficulty: level.difficulty,
            topics: [],
          });
        }
        techEntry.levels.get(level.id)!.topics.push({
          id: tp.topic.id,
          name: localize(tp.topic.name, locale),
          score: tp.score,
        });
      }
    }

    return Array.from(byTechnology.values()).map((tech) => ({
      id: tech.id,
      name: tech.name,
      levels: Array.from(tech.levels.values()),
    }));
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
}
