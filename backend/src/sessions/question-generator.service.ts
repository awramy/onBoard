import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { AiService } from '../ai/ai.service';
import { localize } from '../common/utils/i18n';

export interface GeneratedQuestion {
  questionId: string;
  questionText: string;
  difficulty: number;
  order: number;
}

interface SelectedQuestion {
  questionId: string;
  text: unknown;
  explanation?: unknown;
  difficulty: number;
  topicId: string;
}

@Injectable()
export class QuestionGeneratorService {
  private readonly logger = new Logger(QuestionGeneratorService.name);
  // AI-NOTE: Сколько последних попыток по вопросу попадает в контекст AI при генерации follow-up
  private static readonly MAX_HISTORY_FOR_AI = 5;

  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
    private aiService: AiService,
  ) {}

  // AI-NOTE: Round-robin генерация вопросов для сессии — сначала неотвеченные, потом low-mastery.
  // Для вопросов с 0 < mastery < 1 текст уточняется через AiService (фаза 6).
  async generate(
    sessionId: string,
    userId: string,
    technologyLevelId: string,
    totalQuestions: number,
    locale: string = 'en',
    modelName: string = 'auto',
  ): Promise<GeneratedQuestion[]> {
    const selected: SelectedQuestion[] = [];

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
            explanation: q.explanation,
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
          explanation: progress.question.explanation,
          difficulty: progress.question.difficulty,
          topicId: progress.question.topicId,
        });
        selectedIds.add(progress.questionId);
      }
    }

    const sessionQuestions: GeneratedQuestion[] = [];

    for (let i = 0; i < selected.length; i++) {
      const s = selected[i];
      const questionText = await this.resolveQuestionText(
        userId,
        s,
        locale,
        modelName,
      );

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

  // AI-NOTE: Возвращает финальный questionText для InterviewSessionQuestion.
  // Если у пользователя уже были попытки по вопросу (0 < mastery < 1) и AI доступен —
  // генерируем уточняющий вопрос, фокусирующийся на recommendations из прошлых ответов.
  // Иначе — оригинальный локализованный текст. Любая ошибка AI ведёт к fallback.
  private async resolveQuestionText(
    userId: string,
    selected: SelectedQuestion,
    locale: string,
    modelName: string,
  ): Promise<string> {
    const originalText = localize(selected.text, locale) ?? '';

    const progress = await this.progressService.getQuestionProgress(
      userId,
      selected.questionId,
    );

    const mastery = progress?.mastery ?? 0;
    const shouldUseAi =
      progress !== null &&
      mastery > 0 &&
      mastery < 1 &&
      this.aiService.hasProviders();

    if (!shouldUseAi) {
      return originalText;
    }

    try {
      const history = await this.getAnswerHistoryForAi(
        userId,
        selected.questionId,
      );

      if (history.length === 0) {
        return originalText;
      }

      const explanationText = selected.explanation
        ? (localize(selected.explanation, locale) ?? '')
        : '';

      const generated = await this.aiService.generateQuestionText(
        {
          originalQuestionText: originalText,
          explanation: explanationText,
          previousAnswers: history,
          currentMastery: mastery,
          locale,
        },
        modelName,
      );

      const trimmed = generated?.trim();
      if (!trimmed) {
        this.logger.warn(
          `AI returned empty follow-up for question ${selected.questionId}, fallback to original`,
        );
        return originalText;
      }

      this.logger.debug(
        `AI follow-up generated for question ${selected.questionId} (mastery=${mastery})`,
      );
      return trimmed;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown AI error';
      this.logger.warn(
        `AI follow-up generation failed for question ${selected.questionId}: ${message}. Falling back to original text.`,
      );
      return originalText;
    }
  }

  // AI-NOTE: Собирает историю попыток пользователя по questionId через join
  // InterviewAnswer → InterviewSessionQuestion → InterviewSession.
  private async getAnswerHistoryForAi(userId: string, questionId: string) {
    const answers = await this.prisma.interviewAnswer.findMany({
      where: {
        sessionQuestion: {
          questionId,
          session: { userId },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: QuestionGeneratorService.MAX_HISTORY_FOR_AI,
      select: {
        answerText: true,
        aiFeedback: true,
        recommendations: true,
        score: true,
      },
    });

    return answers.map((a) => ({
      text: a.answerText,
      feedback: a.aiFeedback ?? '',
      score: a.score,
      recommendations: Array.isArray(a.recommendations)
        ? (a.recommendations as string[])
        : [],
    }));
  }
}
