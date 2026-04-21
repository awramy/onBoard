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

  // AI-NOTE: Формирует промпт для оценки ответа с учётом уровня, сложности, истории и isDivide
  protected buildEvaluationPrompt(ctx: EvaluateAnswerContext): string {
    let prompt = `Question: ${this.truncateText(ctx.questionText, BaseAiProvider.MAX_QUESTION_LENGTH)}\n`;
    prompt += `Reference: ${this.truncateText(ctx.questionExplanation, BaseAiProvider.MAX_EXPLANATION_LENGTH)}\n`;
    prompt += `Answer: ${this.truncateText(ctx.answerText, BaseAiProvider.MAX_ANSWER_LENGTH)}\n`;
    prompt += `Difficulty: ${ctx.difficulty ?? 'middle'}\n`;
    prompt += `QuestionDifficulty: ${ctx.questionDifficulty ?? 3}\n`;
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
    const candidates = BaseAiProvider.collectEvaluationJsonCandidates(text);
    const seen = new Set<string>();
    for (const candidate of candidates) {
      if (seen.has(candidate)) continue;
      seen.add(candidate);
      try {
        const parsed = JSON.parse(candidate) as Record<string, unknown>;
        return this.mapParsedEvaluation(parsed);
      } catch {
        /* пробуем следующий вариант */
      }
    }

    const preview =
      text.length > 500 ? `${text.slice(0, 500)}…` : text;
    this.logger.warn(`Failed to parse AI response: ${preview}`);
    return {
      score: 0,
      feedback: this.compactFeedback(text || 'Failed to evaluate answer'),
      isFullyClosed: false,
      recommendations: [],
    };
  }

  private mapParsedEvaluation(parsed: Record<string, unknown>): EvaluationResult {
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
  }

  /** Кандидаты на парсинг: снятие markdown-ограждений, извлечение первого JSON-объекта по скобкам (устойчиво к преамбуле). */
  private static collectEvaluationJsonCandidates(text: string): string[] {
    const out: string[] = [];
    const push = (s: string | null | undefined) => {
      const t = s?.trim();
      if (t) out.push(t);
    };

    push(BaseAiProvider.stripEvaluationMarkdownFences(text));
    push(text.replace(/```json\n?|```\n?/gi, '').trim());
    push(BaseAiProvider.extractFirstJsonObject(text));
    push(
      BaseAiProvider.extractFirstJsonObject(
        BaseAiProvider.stripEvaluationMarkdownFences(text),
      ),
    );

    return out;
  }

  private static stripEvaluationMarkdownFences(raw: string): string {
    let s = raw.replace(/^\uFEFF/, '').trim();
    const fullFence = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```\s*$/i.exec(s);
    if (fullFence) {
      return fullFence[1].trim();
    }
    s = s
      .replace(/^```(?:json)?\s*\r?\n?/i, '')
      .replace(/\r?\n?```\s*$/i, '')
      .trim();
    return s;
  }

  /** Первый сбалансированный `{ ... }` с учётом строк и escape — для ответов с преамбулой или частичным fence. */
  private static extractFirstJsonObject(text: string): string | null {
    const start = text.indexOf('{');
    if (start === -1) {
      return null;
    }
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\' && inString) {
        escape = true;
        continue;
      }
      if (c === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) {
            return text.slice(start, i + 1);
          }
        }
      }
    }
    return null;
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
