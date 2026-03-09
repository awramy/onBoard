import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
  AiProvider,
  EvaluateAnswerContext,
  EvaluationResult,
  GenerateQuestionContext,
  EVALUATION_SYSTEM_PROMPT,
  QUESTION_GEN_SYSTEM_PROMPT,
} from '../ai.interfaces';

@Injectable()
export class GeminiProvider implements AiProvider {
  readonly name = 'gemini';
  private client: GoogleGenAI | null = null;
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly model: string;

  constructor() {
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    } else {
      this.logger.warn('GEMINI_API_KEY not set — provider will be unavailable');
    }
  }

  // AI-NOTE: Проверяет наличие API-ключа для работы провайдера
  isAvailable(): boolean {
    return this.client !== null;
  }

  // AI-NOTE: Отправляет ответ кандидата в Gemini и парсит JSON-оценку
  async evaluateAnswer(ctx: EvaluateAnswerContext): Promise<EvaluationResult> {
    if (!this.client) throw new Error('Gemini provider is not configured');

    const userPrompt = this.buildEvaluationPrompt(ctx);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: userPrompt,
      config: {
        systemInstruction: EVALUATION_SYSTEM_PROMPT,
        temperature: 0.3,
      },
    });

    const text = response.text ?? '';
    return this.parseEvaluationResponse(text);
  }

  // AI-NOTE: Генерирует уточняющий текст вопроса на основе истории ответов
  async generateQuestionText(ctx: GenerateQuestionContext): Promise<string> {
    if (!this.client) throw new Error('Gemini provider is not configured');

    const userPrompt = this.buildQuestionGenPrompt(ctx);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: userPrompt,
      config: {
        systemInstruction: QUESTION_GEN_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return (response.text ?? '').trim();
  }

  // AI-NOTE: Формирует промпт для оценки ответа с учётом истории и isDivide
  private buildEvaluationPrompt(ctx: EvaluateAnswerContext): string {
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
  private buildQuestionGenPrompt(ctx: GenerateQuestionContext): string {
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
  private parseEvaluationResponse(text: string): EvaluationResult {
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
      this.logger.warn(`Failed to parse Gemini response: ${text}`);
      return {
        score: 0,
        feedback: text || 'Failed to evaluate answer',
        isFullyClosed: false,
        recommendations: [],
      };
    }
  }
}
