import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async findAll(userId: string) {
    return this.prisma.interviewSession.findMany({
      where: { userId },
      include: { technologyLevel: { include: { technology: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id, userId },
      include: {
        technologyLevel: { include: { technology: true } },
        questions: { include: { answers: true }, orderBy: { order: 'asc' } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
