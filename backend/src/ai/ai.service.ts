import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import {
  AiProviderHealthSummary,
  AiProvider,
  AiProviderRegistration,
  AiModelTestResult,
  AiModelTestSummary,
  AiTestOperation,
  EvaluateAnswerContext,
  EvaluationResult,
  GenerateQuestionContext,
} from './ai.interfaces';

@Injectable()
export class AiService {
  private readonly providers = new Map<string, AiProvider>();
  private readonly logger = new Logger(AiService.name);
  // AI-NOTE: Читается из AI_DEFAULT_PROVIDER env; если не задан — openai
  private defaultProviderName: string =
    process.env.AI_DEFAULT_PROVIDER || 'openai';

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
      this.providers.set(this.geminiProvider.modelId, this.geminiProvider);
      this.logger.log(
        `Gemini provider registered (model: ${this.geminiProvider.modelId})`,
      );
    }

    if (this.openAiProvider.isAvailable()) {
      this.providers.set('openai', this.openAiProvider);
      this.providers.set('gpt-4o', this.openAiProvider);
      this.providers.set('gpt-4o-mini', this.openAiProvider);
      this.providers.set(this.openAiProvider.modelId, this.openAiProvider);
      this.logger.log(
        `OpenAI provider registered (model: ${this.openAiProvider.modelId})`,
      );
    }

    if (this.providers.size === 0) {
      this.logger.warn(
        'No AI providers configured — set GEMINI_API_KEY or OPENAI_API_KEY',
      );
    } else {
      // AI-NOTE: Если запрошенный дефолтный провайдер недоступен — берём первый зарегистрированный
      if (!this.providers.has(this.defaultProviderName)) {
        const fallback = [...this.providers.keys()][0];
        this.logger.warn(
          `Default provider "${this.defaultProviderName}" is not available, falling back to "${fallback}"`,
        );
        this.defaultProviderName = fallback;
      }
      this.logger.log(`Default AI provider: ${this.defaultProviderName}`);
    }
  }

  // AI-NOTE: Возвращает провайдер по имени модели; "auto" → дефолтный провайдер
  getProvider(modelName?: string): AiProvider {
    const name =
      modelName === 'auto' || !modelName ? this.defaultProviderName : modelName;

    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(
        `AI provider "${name}" is not available. Configured: [${[...this.providers.keys()].join(', ')}]`,
      );
    }
    this.logger.debug(
      `Using AI provider: ${provider.name} (${provider.modelId})`,
    );
    return provider;
  }

  // AI-NOTE: Список зарегистрированных провайдеров для диагностики
  getAvailableProviders(): string[] {
    return [...new Set([...this.providers.values()].map((p) => p.name))];
  }

  // AI-NOTE: Возвращает зарегистрированные модели с алиасами и признаком дефолтного провайдера
  getProviderRegistrations(): AiProviderRegistration[] {
    return this.getUniqueProviders().map((provider) => ({
      name: provider.name,
      modelId: provider.modelId,
      aliases: this.getAliasesForProvider(provider),
      isDefault: provider.name === this.defaultProviderName,
    }));
  }

  getProviderHealthSummary(): AiProviderHealthSummary {
    return {
      hasProviders: this.hasProviders(),
      providers: this.getProviderRegistrations(),
    };
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

  async getGeminiEgressDiagnostics() {
    return this.geminiProvider.getEgressDiagnostics();
  }

  // AI-NOTE: Прогоняет lightweight-запрос к одной или всем доступным моделям
  async testModels(
    modelName?: string,
    operation: AiTestOperation = 'evaluate',
  ): Promise<AiModelTestSummary> {
    const providers = modelName
      ? [this.getProvider(modelName)]
      : this.getUniqueProviders();

    const results = await Promise.all(
      providers.map((provider) =>
        this.runProviderTest(provider, operation, modelName),
      ),
    );

    return {
      operation,
      total: results.length,
      passed: results.filter((result) => result.success).length,
      failed: results.filter((result) => !result.success).length,
      results,
    };
  }

  private getUniqueProviders(): AiProvider[] {
    const uniqueProviders = new Map<string, AiProvider>();
    for (const provider of this.providers.values()) {
      uniqueProviders.set(`${provider.name}:${provider.modelId}`, provider);
    }
    return [...uniqueProviders.values()];
  }

  private getAliasesForProvider(provider: AiProvider): string[] {
    return [...this.providers.entries()]
      .filter(([, registeredProvider]) => registeredProvider === provider)
      .map(([alias]) => alias)
      .sort((left, right) => left.localeCompare(right));
  }

  private async runProviderTest(
    provider: AiProvider,
    operation: AiTestOperation,
    requestedModel?: string,
  ): Promise<AiModelTestResult> {
    const startedAt = Date.now();

    try {
      const result =
        operation === 'generate'
          ? await provider.generateQuestionText({
              originalQuestionText: 'What is HTTP?',
              explanation:
                'HTTP is a stateless application-layer protocol for request/response communication between clients and servers.',
              previousAnswers: [
                {
                  text: 'HTTP is used by browsers and servers to exchange data.',
                  feedback:
                    'The answer is partially correct but misses protocol characteristics.',
                  score: 60,
                },
              ],
              currentMastery: 0.4,
            })
          : await provider.evaluateAnswer({
              questionText: 'What is HTTP?',
              questionExplanation:
                'HTTP is a stateless application-layer protocol for request/response communication between clients and servers.',
              answerText:
                'HTTP is a stateless protocol used by browsers and servers to exchange requests and responses.',
              previousAnswers: [],
              isDivide: false,
              currentMastery: 0.4,
            });

      return {
        requestedModel: requestedModel ?? provider.modelId,
        providerName: provider.name,
        modelId: provider.modelId,
        aliases: this.getAliasesForProvider(provider),
        operation,
        success: true,
        latencyMs: Date.now() - startedAt,
        result,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown AI provider error';

      this.logger.warn(
        `AI model test failed for ${provider.name} (${provider.modelId}): ${message}`,
      );

      return {
        requestedModel: requestedModel ?? provider.modelId,
        providerName: provider.name,
        modelId: provider.modelId,
        aliases: this.getAliasesForProvider(provider),
        operation,
        success: false,
        latencyMs: Date.now() - startedAt,
        error: message,
      };
    }
  }
}
