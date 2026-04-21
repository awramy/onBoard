import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import {
  EvaluateAnswerContext,
  EvaluationResult,
  GenerateQuestionContext,
  EVALUATION_SYSTEM_PROMPT,
  QUESTION_GEN_SYSTEM_PROMPT,
} from '../ai.interfaces';
import { BaseAiProvider } from './base-ai.provider';

@Injectable()
export class OpenAiProvider extends BaseAiProvider {
  readonly name = 'openai';
  private client: OpenAI | null = null;
  protected readonly logger = new Logger(OpenAiProvider.name);
  readonly modelId: string;

  constructor() {
    super();
    this.modelId = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY not set — provider will be unavailable');
    }
  }

  // AI-NOTE: Проверяет наличие API-ключа для работы провайдера
  isAvailable(): boolean {
    return this.client !== null;
  }

  // AI-NOTE: Отправляет ответ кандидата в OpenAI и парсит JSON-оценку
  async evaluateAnswer(ctx: EvaluateAnswerContext): Promise<EvaluationResult> {
    if (!this.client) throw new Error('OpenAI provider is not configured');

    const userPrompt = this.buildEvaluationPrompt(ctx);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.modelId,
        messages: [
          { role: 'developer', content: EVALUATION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: this.getTemperature(0.3),
      });
      const text = completion.choices[0]?.message?.content ?? '';
      return this.parseEvaluationResponse(text);
    } catch (error) {
      this.logger.error(`Failed to evaluate answer: ${error}`);
      throw error;
    }
  }

  // AI-NOTE: Генерирует уточняющий текст вопроса на основе истории ответов
  async generateQuestionText(ctx: GenerateQuestionContext): Promise<string> {
    if (!this.client) throw new Error('OpenAI provider is not configured');

    const userPrompt = this.buildQuestionGenPrompt(ctx);

    const completion = await this.client.chat.completions.create({
      model: this.modelId,
      messages: [
        { role: 'developer', content: QUESTION_GEN_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: this.getTemperature(0.7),
    });

    return this.finalizeGeneratedQuestion(
      completion.choices[0]?.message?.content ?? '',
    );
  }

  private getTemperature(defaultTemperature: number): number {
    return this.modelId === 'gpt-5-nano' ? 1 : defaultTemperature;
  }
}
