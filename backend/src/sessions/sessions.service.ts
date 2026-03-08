import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { localize } from '../common/utils/i18n';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

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
        questionText: localize(q.questionText, locale),
      })),
    };
  }
}
