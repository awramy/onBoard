import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getQuestionProgress(userId: string, questionId: string) {
    return this.prisma.userQuestionProgress.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
  }

  async getTopicProgress(userId: string, topicId: string) {
    return this.prisma.userTopicProgress.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });
  }

  async getUnansweredQuestions(userId: string, technologyLevelId: string) {
    const levelTopics = await this.prisma.technologyLevelTopic.findMany({
      where: { technologyLevelId },
      select: { topicId: true },
    });
    const topicIds = levelTopics.map((lt) => lt.topicId);

    const answeredQuestionIds = await this.prisma.userQuestionProgress
      .findMany({
        where: {
          userId,
          question: { topicId: { in: topicIds } },
        },
        select: { questionId: true },
      })
      .then((rows) => rows.map((r) => r.questionId));

    return this.prisma.question.findMany({
      where: {
        topicId: { in: topicIds },
        ...(answeredQuestionIds.length > 0 && {
          id: { notIn: answeredQuestionIds },
        }),
      },
      include: { topic: true },
      orderBy: [{ topicId: 'asc' }, { difficulty: 'asc' }],
    });
  }

  async getLowestMasteryQuestions(
    userId: string,
    technologyLevelId: string,
    limit: number,
  ) {
    const levelTopics = await this.prisma.technologyLevelTopic.findMany({
      where: { technologyLevelId },
      select: { topicId: true },
    });
    const topicIds = levelTopics.map((lt) => lt.topicId);

    return this.prisma.userQuestionProgress.findMany({
      where: {
        userId,
        question: { topicId: { in: topicIds } },
      },
      include: { question: { include: { topic: true } } },
      orderBy: { mastery: 'asc' },
      take: limit,
    });
  }

  async updateQuestionProgress(
    userId: string,
    questionId: string,
    score: number,
  ) {
    const existing = await this.prisma.userQuestionProgress.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    if (existing) {
      const newAttempts = existing.attemptsCount + 1;
      const newTotalScore = existing.totalScore + score;
      const mastery = Math.min(newTotalScore / (newAttempts * 100), 1.0);

      return this.prisma.userQuestionProgress.update({
        where: { id: existing.id },
        data: {
          attemptsCount: newAttempts,
          totalScore: newTotalScore,
          lastScore: score,
          mastery,
          lastAnsweredAt: new Date(),
        },
      });
    }

    return this.prisma.userQuestionProgress.create({
      data: {
        userId,
        questionId,
        attemptsCount: 1,
        totalScore: score,
        lastScore: score,
        mastery: Math.min(score / 100, 1.0),
        lastAnsweredAt: new Date(),
      },
    });
  }

  async recalcTopicProgress(userId: string, topicId: string) {
    const questions = await this.prisma.question.findMany({
      where: { topicId },
      select: { id: true },
    });
    const questionIds = questions.map((q) => q.id);

    if (questionIds.length === 0) return;

    const progressRows = await this.prisma.userQuestionProgress.findMany({
      where: { userId, questionId: { in: questionIds } },
    });

    const totalMastery = progressRows.reduce((sum, p) => sum + p.mastery, 0);
    const score = Math.round((totalMastery / questionIds.length) * 100);

    await this.prisma.userTopicProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { score, lastUpdated: new Date() },
      create: { userId, topicId, score, lastUpdated: new Date() },
    });
  }
}
