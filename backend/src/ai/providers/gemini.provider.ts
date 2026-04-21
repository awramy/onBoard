import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
  EvaluateAnswerContext,
  EvaluationResult,
  GenerateQuestionContext,
  EVALUATION_SYSTEM_PROMPT,
  QUESTION_GEN_SYSTEM_PROMPT,
} from '../ai.interfaces';
import { BaseAiProvider } from './base-ai.provider';
import {
  applyGeminiTransportConfig,
  collectGeminiEgressDiagnostics,
  DEFAULT_GEMINI_BASE_URL,
  type GeminiEgressDiagnostics,
  resolveGeminiTransportConfig,
} from './gemini.transport';

@Injectable()
export class GeminiProvider extends BaseAiProvider {
  readonly name = 'gemini';
  /** Кириллица расходует ~2 токена/символ, поэтому лимит должен быть достаточно большим для полного JSON-ответа. */
  private static readonly EVALUATE_MAX_OUTPUT_TOKENS = 1500;
  private static readonly GENERATE_MAX_OUTPUT_TOKENS = 60;
  private client: GoogleGenAI | null = null;
  protected readonly logger = new Logger(GeminiProvider.name);
  readonly modelId: string;
  readonly baseUrl: string;

  constructor() {
    super();
    this.modelId = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const transportConfig = resolveGeminiTransportConfig();
    this.baseUrl = transportConfig.baseUrl;
    applyGeminiTransportConfig(transportConfig, this.logger);

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenAI({
        apiKey,
        httpOptions:
          transportConfig.baseUrl !== DEFAULT_GEMINI_BASE_URL
            ? {
                baseUrl: transportConfig.baseUrl,
              }
            : undefined,
      });
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
      model: this.modelId,
      contents: userPrompt,
      config: {
        systemInstruction: EVALUATION_SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: GeminiProvider.EVALUATE_MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
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
      model: this.modelId,
      contents: userPrompt,
      config: {
        systemInstruction: QUESTION_GEN_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: GeminiProvider.GENERATE_MAX_OUTPUT_TOKENS,
      },
    });

    return this.finalizeGeneratedQuestion(response.text ?? '');
  }

  async getEgressDiagnostics(): Promise<GeminiEgressDiagnostics> {
    return collectGeminiEgressDiagnostics(resolveGeminiTransportConfig());
  }
}
