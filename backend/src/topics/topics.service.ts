import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { localize } from '../common/utils/i18n';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async findByLevel(
    levelId: string,
    locale: string,
    skip: number,
    take: number,
  ) {
    const items = await this.prisma.technologyLevelTopic.findMany({
      where: { technologyLevelId: levelId },
      include: {
        topic: {
          include: { _count: { select: { questions: true } } },
        },
      },
      skip,
      take,
    });

    return items.map((lt) => ({
      id: lt.topic.id,
      name: localize(lt.topic.name, locale),
      description: localize(lt.topic.description, locale),
      questionsCount: lt.topic._count.questions,
      createdAt: lt.topic.createdAt,
    }));
  }

  async findOne(id: string, locale: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });
    if (!topic) throw new NotFoundException('Topic not found');

    return {
      id: topic.id,
      name: localize(topic.name, locale),
      description: localize(topic.description, locale),
      questionsCount: topic._count.questions,
      createdAt: topic.createdAt,
    };
  }
}
