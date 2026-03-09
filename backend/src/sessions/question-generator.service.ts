import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { localize } from '../common/utils/i18n';

export interface GeneratedQuestion {
  questionId: string;
  questionText: string;
  difficulty: number;
  order: number;
}

@Injectable()
export class QuestionGeneratorService {
  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
  ) {}

  // AI-NOTE: Round-robin генерация вопросов для сессии — сначала неотвеченные, потом low-mastery
  async generate(
    sessionId: string,
    userId: string,
    technologyLevelId: string,
    totalQuestions: number,
    locale: string = 'en',
  ): Promise<GeneratedQuestion[]> {
    const selected: {
      questionId: string;
      text: unknown;
      difficulty: number;
      topicId: string;
    }[] = [];

    const unanswered = await this.progressService.getUnansweredQuestions(
      userId,
      technologyLevelId,
    );

    const byTopic = new Map<string, typeof unanswered>();
    for (const q of unanswered) {
      const list = byTopic.get(q.topicId) ?? [];
      list.push(q);
      byTopic.set(q.topicId, list);
    }

    const topicIds = [...byTopic.keys()];
    const topicPointers = new Map<string, number>();
    for (const tid of topicIds) topicPointers.set(tid, 0);

    let passes = 0;
    while (selected.length < totalQuestions && passes < totalQuestions) {
      for (const tid of topicIds) {
        if (selected.length >= totalQuestions) break;

        const questions = byTopic.get(tid) ?? [];
        const pointer = topicPointers.get(tid) ?? 0;

        if (pointer < questions.length) {
          const q = questions[pointer];
          selected.push({
            questionId: q.id,
            text: q.text,
            difficulty: q.difficulty,
            topicId: q.topicId,
          });
          topicPointers.set(tid, pointer + 1);
        }
      }
      passes++;
    }

    if (selected.length < totalQuestions) {
      const remaining = totalQuestions - selected.length;
      const selectedIds = new Set(selected.map((s) => s.questionId));

      const lowMastery = await this.progressService.getLowestMasteryQuestions(
        userId,
        technologyLevelId,
        remaining + selectedIds.size,
      );

      for (const progress of lowMastery) {
        if (selected.length >= totalQuestions) break;
        if (selectedIds.has(progress.questionId)) continue;

        selected.push({
          questionId: progress.question.id,
          text: progress.question.text,
          difficulty: progress.question.difficulty,
          topicId: progress.question.topicId,
        });
        selectedIds.add(progress.questionId);
      }
    }

    const sessionQuestions: GeneratedQuestion[] = [];

    for (let i = 0; i < selected.length; i++) {
      const s = selected[i];
      const questionText = localize(s.text, locale) ?? '';

      const sq = await this.prisma.interviewSessionQuestion.create({
        data: {
          sessionId,
          questionId: s.questionId,
          questionText,
          difficulty: s.difficulty,
          order: i + 1,
        },
      });

      sessionQuestions.push({
        questionId: s.questionId,
        questionText: sq.questionText,
        difficulty: sq.difficulty,
        order: sq.order,
      });
    }

    return sessionQuestions;
  }
}
