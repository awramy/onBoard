import { Logger } from '@nestjs/common';
import {
  AiProvider,
  EvaluateAnswerContext,
  EvaluationResult,
  GenerateQuestionContext,
} from '../ai.interfaces';

export abstract class BaseAiProvider implements AiProvider {
  abstract readonly name: string;
  abstract readonly modelId: string;
  protected abstract readonly logger: Logger;
  protected static readonly MAX_QUESTION_LENGTH = 180;
  protected static readonly MAX_EXPLANATION_LENGTH = 320;
  protected static readonly MAX_ANSWER_LENGTH = 240;
  protected static readonly MAX_PREVIOUS_ANSWERS = 2;
  protected static readonly MAX_PREVIOUS_FEEDBACK_LENGTH = 100;
  protected static readonly MAX_FEEDBACK_LENGTH = 220;
  protected static readonly MAX_RECOMMENDATIONS = 2;
  protected static readonly MAX_RECOMMENDATION_LENGTH = 60;
  protected static readonly MAX_GENERATED_QUESTION_LENGTH = 120;

  abstract isAvailable(): boolean;
  abstract evaluateAnswer(
    ctx: EvaluateAnswerContext,
  ): Promise<EvaluationResult>;
  abstract generateQuestionText(ctx: GenerateQuestionContext): Promise<string>;

  // AI-NOTE: Формирует промпт для оценки ответа с учётом истории и isDivide
  protected buildEvaluationPrompt(ctx: EvaluateAnswerContext): string {
    let prompt = `Question: ${this.truncateText(ctx.questionText, BaseAiProvider.MAX_QUESTION_LENGTH)}\n`;
    prompt += `Reference: ${this.truncateText(ctx.questionExplanation, BaseAiProvider.MAX_EXPLANATION_LENGTH)}\n`;
    prompt += `Answer: ${this.truncateText(ctx.answerText, BaseAiProvider.MAX_ANSWER_LENGTH)}\n`;
    prompt += `isDivide: ${ctx.isDivide ? 'yes' : 'no'}\n`;
    prompt += `Mastery: ${ctx.currentMastery}\n`;

    if (ctx.previousAnswers?.length) {
      prompt += `\nPrevious attempts:\n`;
      for (const pa of ctx.previousAnswers.slice(
        -BaseAiProvider.MAX_PREVIOUS_ANSWERS,
      )) {
        prompt += `- score=${pa.score}; answer=${this.truncateText(pa.text, BaseAiProvider.MAX_ANSWER_LENGTH)}; feedback=${this.truncateText(pa.feedback, BaseAiProvider.MAX_PREVIOUS_FEEDBACK_LENGTH)}\n`;
      }
    }

    return prompt;
  }

  // AI-NOTE: Формирует промпт для генерации уточняющего вопроса
  protected buildQuestionGenPrompt(ctx: GenerateQuestionContext): string {
    let prompt = `Original question: ${this.truncateText(ctx.originalQuestionText, BaseAiProvider.MAX_QUESTION_LENGTH)}\n`;
    prompt += `Reference: ${this.truncateText(ctx.explanation, BaseAiProvider.MAX_EXPLANATION_LENGTH)}\n`;
    prompt += `Mastery: ${ctx.currentMastery}\n`;

    if (ctx.previousAnswers.length) {
      prompt += `\nPrevious answers:\n`;
      for (const pa of ctx.previousAnswers.slice(
        -BaseAiProvider.MAX_PREVIOUS_ANSWERS,
      )) {
        prompt += `- score=${pa.score}; answer=${this.truncateText(pa.text, BaseAiProvider.MAX_ANSWER_LENGTH)}; feedback=${this.truncateText(pa.feedback, BaseAiProvider.MAX_PREVIOUS_FEEDBACK_LENGTH)}\n`;
      }
    }

    prompt += `\nAsk one short follow-up question about the biggest remaining gap.`;
    return prompt;
  }

  // AI-NOTE: Парсит JSON-ответ от модели, возвращает дефолтный результат при ошибке парсинга
  protected parseEvaluationResponse(text: string): EvaluationResult {
    try {
      const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      const recs = parsed.recommendations;
      return {
        score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
        feedback: this.compactFeedback(
          typeof parsed.feedback === 'string' ? parsed.feedback : '',
        ),
        isFullyClosed: Boolean(parsed.isFullyClosed),
        recommendations: Array.isArray(recs)
          ? recs
              .map((value) => this.compactRecommendation(String(value)))
              .filter(Boolean)
              .slice(0, BaseAiProvider.MAX_RECOMMENDATIONS)
          : [],
      };
    } catch {
      this.logger.warn(`Failed to parse AI response: ${text}`);
      return {
        score: 0,
        feedback: this.compactFeedback(text || 'Failed to evaluate answer'),
        isFullyClosed: false,
        recommendations: [],
      };
    }
  }

  protected finalizeGeneratedQuestion(text: string): string {
    const withoutCodeBlocks = text.replace(/```[\s\S]*?```/g, ' ').trim();
    const firstLine =
      withoutCodeBlocks
        .split('\n')
        .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
        .find(Boolean) ?? '';
    const normalized = firstLine
      .replace(/^[\s"'`-]+|[\s"'`]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const firstSentence =
      normalized.match(/^[^.!?]+[.!?]?/)?.[0].trim() || normalized;
    const compact = this.truncateText(
      firstSentence,
      BaseAiProvider.MAX_GENERATED_QUESTION_LENGTH,
    );

    if (!compact) {
      return 'Can you explain the missing part more precisely?';
    }

    return /[.!?]$/.test(compact) ? compact : `${compact}?`;
  }

  private compactFeedback(text: string): string {
    const normalized = this.normalizeWhitespace(text);
    const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [];
    const compact = sentences
      .slice(0, 2)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .join(' ');

    return this.truncateText(
      compact || normalized,
      BaseAiProvider.MAX_FEEDBACK_LENGTH,
    );
  }

  private compactRecommendation(text: string): string {
    return this.truncateText(
      this.normalizeWhitespace(text),
      BaseAiProvider.MAX_RECOMMENDATION_LENGTH,
    );
  }

  private normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  private truncateText(text: string, maxLength: number): string {
    const normalized = this.normalizeWhitespace(text);
    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
  }
}
