import { AiService } from './ai.service';
import type { GeminiProvider } from './providers/gemini.provider';
import type { OpenAiProvider } from './providers/openai.provider';

type ProviderDouble = GeminiProvider & OpenAiProvider;
type EvaluateAnswerMock = jest.MockedFunction<GeminiProvider['evaluateAnswer']>;
type GenerateQuestionTextMock = jest.MockedFunction<
  GeminiProvider['generateQuestionText']
>;
type MockProvider = {
  provider: ProviderDouble;
  evaluateAnswerMock: EvaluateAnswerMock;
  generateQuestionTextMock: GenerateQuestionTextMock;
};

function createMockProvider(overrides: {
  name: string;
  modelId: string;
  isAvailable: () => boolean;
}): MockProvider {
  const evaluateAnswerMock = jest.fn() as EvaluateAnswerMock;
  const generateQuestionTextMock = jest.fn() as GenerateQuestionTextMock;

  return {
    provider: {
      name: overrides.name,
      modelId: overrides.modelId,
      isAvailable: overrides.isAvailable,
      evaluateAnswer: evaluateAnswerMock,
      generateQuestionText: generateQuestionTextMock,
    } as unknown as ProviderDouble,
    evaluateAnswerMock,
    generateQuestionTextMock,
  };
}

describe('AiService', () => {
  it('routes by hardcoded alias "gemini"', () => {
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: 'gemini-2.0-flash',
      isAvailable: () => true,
    });
    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4o-mini',
      isAvailable: () => false,
    });

    const service = new AiService(gemini.provider, openai.provider);
    expect(service.getProvider('gemini').name).toBe('gemini');
  });

  it('routes by env-configured model name for Gemini', () => {
    const customModel = 'gemini-2.5-pro';
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: customModel,
      isAvailable: () => true,
    });
    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4o-mini',
      isAvailable: () => false,
    });

    const service = new AiService(gemini.provider, openai.provider);
    expect(service.getProvider(customModel).name).toBe('gemini');
  });

  it('routes by env-configured model name for OpenAI', () => {
    const customModel = 'gpt-4.1-mini';
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: 'gemini-2.0-flash',
      isAvailable: () => false,
    });
    const openai = createMockProvider({
      name: 'openai',
      modelId: customModel,
      isAvailable: () => true,
    });

    const service = new AiService(gemini.provider, openai.provider);
    expect(service.getProvider(customModel).name).toBe('openai');
  });

  it('throws for an unregistered model name', () => {
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: 'gemini-2.0-flash',
      isAvailable: () => true,
    });
    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4o-mini',
      isAvailable: () => false,
    });

    const service = new AiService(gemini.provider, openai.provider);
    expect(() => service.getProvider('unknown-model')).toThrow(/not available/);
  });

  it('"auto" resolves to default provider', () => {
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: 'gemini-2.0-flash',
      isAvailable: () => true,
    });
    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4o-mini',
      isAvailable: () => true,
    });

    const service = new AiService(gemini.provider, openai.provider);
    expect(service.getProvider('auto').name).toBe('gemini');
  });

  it('falls back to openai as default when gemini is unavailable', () => {
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: 'gemini-2.0-flash',
      isAvailable: () => false,
    });
    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4o-mini',
      isAvailable: () => true,
    });

    const service = new AiService(gemini.provider, openai.provider);
    expect(service.getProvider('auto').name).toBe('openai');
  });

  it('returns provider registrations with aliases and default flag', () => {
    const customGeminiModel = 'gemini-2.5-pro';
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: customGeminiModel,
      isAvailable: () => true,
    });
    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4.1-mini',
      isAvailable: () => true,
    });

    const service = new AiService(gemini.provider, openai.provider);

    expect(service.getProviderRegistrations()).toEqual([
      {
        name: 'gemini',
        modelId: customGeminiModel,
        aliases: ['gemini', 'gemini-2.0-flash', customGeminiModel],
        isDefault: true,
      },
      {
        name: 'openai',
        modelId: 'gpt-4.1-mini',
        aliases: ['gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini', 'openai'],
        isDefault: false,
      },
    ]);
  });

  it('tests all registered providers without duplicate alias runs', async () => {
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: 'gemini-2.5-pro',
      isAvailable: () => true,
    });
    gemini.evaluateAnswerMock.mockResolvedValue({
      score: 90,
      feedback: 'Looks good',
      isFullyClosed: true,
      recommendations: [],
    });

    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4.1-mini',
      isAvailable: () => true,
    });
    openai.evaluateAnswerMock.mockResolvedValue({
      score: 85,
      feedback: 'Solid answer',
      isFullyClosed: true,
      recommendations: [],
    });

    const service = new AiService(gemini.provider, openai.provider);
    const summary = await service.testModels();

    expect(summary.total).toBe(2);
    expect(summary.passed).toBe(2);
    expect(summary.failed).toBe(0);
    expect(summary.results.map((result) => result.modelId)).toEqual([
      'gemini-2.5-pro',
      'gpt-4.1-mini',
    ]);
    expect(gemini.evaluateAnswerMock).toHaveBeenCalledTimes(1);
    expect(openai.evaluateAnswerMock).toHaveBeenCalledTimes(1);
  });

  it('tests a specific model using generate flow', async () => {
    const customModel = 'gemini-2.5-pro';
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: customModel,
      isAvailable: () => true,
    });
    gemini.generateQuestionTextMock.mockResolvedValue(
      'Can you explain why HTTP is stateless?',
    );

    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4o-mini',
      isAvailable: () => false,
    });

    const service = new AiService(gemini.provider, openai.provider);
    const summary = await service.testModels(customModel, 'generate');

    expect(summary.total).toBe(1);
    expect(summary.passed).toBe(1);
    expect(summary.results[0]).toMatchObject({
      requestedModel: customModel,
      providerName: 'gemini',
      modelId: customModel,
      operation: 'generate',
      success: true,
      result: 'Can you explain why HTTP is stateless?',
    });
    expect(gemini.generateQuestionTextMock).toHaveBeenCalledTimes(1);
  });

  it('reports provider errors as failed test results', async () => {
    const gemini = createMockProvider({
      name: 'gemini',
      modelId: 'gemini-2.0-flash',
      isAvailable: () => true,
    });
    gemini.evaluateAnswerMock.mockRejectedValue(new Error('quota exceeded'));

    const openai = createMockProvider({
      name: 'openai',
      modelId: 'gpt-4o-mini',
      isAvailable: () => false,
    });

    const service = new AiService(gemini.provider, openai.provider);
    const summary = await service.testModels('gemini');

    expect(summary.total).toBe(1);
    expect(summary.passed).toBe(0);
    expect(summary.failed).toBe(1);
    expect(summary.results[0]).toMatchObject({
      requestedModel: 'gemini',
      providerName: 'gemini',
      modelId: 'gemini-2.0-flash',
      operation: 'evaluate',
      success: false,
      error: 'quota exceeded',
    });
  });
});
