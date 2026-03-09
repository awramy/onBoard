import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { localize } from '../common/utils/i18n';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findByTopic(
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
        createdAt: true,
      },
      skip,
      take,
      orderBy: { difficulty: 'asc' },
    });

    return questions.map((q) => ({
      id: q.id,
      text: localize(q.text, locale),
      type: q.type,
      difficulty: q.difficulty,
      createdAt: q.createdAt,
    }));
  }

  async findOne(id: string, locale: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { topic: true },
    });
    if (!question) throw new NotFoundException('Question not found');

    return {
      id: question.id,
      text: localize(question.text, locale),
      type: question.type,
      difficulty: question.difficulty,
      explanation: localize(question.explanation, locale),
      isDivide: question.isDivide,
      topicId: question.topicId,
      topicName: localize(question.topic.name, locale),
      createdAt: question.createdAt,
    };
  }
}
