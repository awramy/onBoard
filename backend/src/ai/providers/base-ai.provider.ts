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

  abstract isAvailable(): boolean;
  abstract evaluateAnswer(
    ctx: EvaluateAnswerContext,
  ): Promise<EvaluationResult>;
  abstract generateQuestionText(ctx: GenerateQuestionContext): Promise<string>;

  // AI-NOTE: Формирует промпт для оценки ответа с учётом истории и isDivide
  protected buildEvaluationPrompt(ctx: EvaluateAnswerContext): string {
    let prompt = `Question: ${ctx.questionText}\n`;
    prompt += `Reference explanation: ${ctx.questionExplanation}\n`;
    prompt += `Candidate answer: ${ctx.answerText}\n`;
    prompt += `isDivide: ${ctx.isDivide}\n`;
    prompt += `Current mastery: ${ctx.currentMastery}\n`;

    if (ctx.previousAnswers?.length) {
      prompt += `\nPrevious answers for this question:\n`;
      for (const pa of ctx.previousAnswers) {
        prompt += `- Answer: ${pa.text} | Score: ${pa.score} | Feedback: ${pa.feedback}\n`;
      }
    }

    return prompt;
  }

  // AI-NOTE: Формирует промпт для генерации уточняющего вопроса
  protected buildQuestionGenPrompt(ctx: GenerateQuestionContext): string {
    let prompt = `Original question: ${ctx.originalQuestionText}\n`;
    prompt += `Explanation: ${ctx.explanation}\n`;
    prompt += `Current mastery: ${ctx.currentMastery}\n`;

    if (ctx.previousAnswers.length) {
      prompt += `\nPrevious answers:\n`;
      for (const pa of ctx.previousAnswers) {
        prompt += `- Answer: ${pa.text} | Score: ${pa.score} | Feedback: ${pa.feedback}\n`;
      }
    }

    prompt += `\nGenerate a follow-up question covering uncovered aspects.`;
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
        feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
        isFullyClosed: Boolean(parsed.isFullyClosed),
        recommendations: Array.isArray(recs) ? recs.map(String) : [],
      };
    } catch {
      this.logger.warn(`Failed to parse AI response: ${text}`);
      return {
        score: 0,
        feedback: text || 'Failed to evaluate answer',
        isFullyClosed: false,
        recommendations: [],
      };
    }
  }
}
