import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import {
  AiProvider,
  EvaluateAnswerContext,
  EvaluationResult,
  GenerateQuestionContext,
} from './ai.interfaces';

@Injectable()
export class AiService {
  private readonly providers = new Map<string, AiProvider>();
  private readonly logger = new Logger(AiService.name);
  private defaultProviderName: string = 'gemini';

  constructor(
    private geminiProvider: GeminiProvider,
    private openAiProvider: OpenAiProvider,
  ) {
    this.registerProviders();
  }

  // AI-NOTE: Регистрирует все доступные провайдеры и определяет дефолтный
  private registerProviders() {
    if (this.geminiProvider.isAvailable()) {
      this.providers.set('gemini', this.geminiProvider);
      this.providers.set('gemini-2.0-flash', this.geminiProvider);
      this.logger.log('Gemini provider registered');
    }

    if (this.openAiProvider.isAvailable()) {
      this.providers.set('openai', this.openAiProvider);
      this.providers.set('gpt-4o', this.openAiProvider);
      this.providers.set('gpt-4o-mini', this.openAiProvider);
      this.logger.log('OpenAI provider registered');
    }

    if (this.providers.size === 0) {
      this.logger.warn(
        'No AI providers configured — set GEMINI_API_KEY or OPENAI_API_KEY',
      );
    } else {
      this.defaultProviderName = this.providers.has('gemini')
        ? 'gemini'
        : 'openai';
      this.logger.log(`Default AI provider: ${this.defaultProviderName}`);
    }
  }

  // AI-NOTE: Возвращает провайдер по имени модели; "auto" → дефолтный (бесплатный)
  getProvider(modelName?: string): AiProvider {
    const name =
      modelName === 'auto' || !modelName ? this.defaultProviderName : modelName;

    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(
        `AI provider "${name}" is not available. Configured: [${[...this.providers.keys()].join(', ')}]`,
      );
    }
    return provider;
  }

  // AI-NOTE: Список зарегистрированных провайдеров для диагностики
  getAvailableProviders(): string[] {
    return [...new Set([...this.providers.values()].map((p) => p.name))];
  }

  // AI-NOTE: Есть ли хотя бы один рабочий провайдер
  hasProviders(): boolean {
    return this.providers.size > 0;
  }

  // AI-NOTE: Фасад — оценка ответа через выбранного провайдера
  async evaluateAnswer(
    ctx: EvaluateAnswerContext,
    modelName?: string,
  ): Promise<EvaluationResult> {
    const provider = this.getProvider(modelName);
    this.logger.debug(`Evaluating answer via ${provider.name}`);
    return provider.evaluateAnswer(ctx);
  }

  // AI-NOTE: Фасад — генерация текста вопроса через выбранного провайдера
  async generateQuestionText(
    ctx: GenerateQuestionContext,
    modelName?: string,
  ): Promise<string> {
    const provider = this.getProvider(modelName);
    this.logger.debug(`Generating question text via ${provider.name}`);
    return provider.generateQuestionText(ctx);
  }
}
