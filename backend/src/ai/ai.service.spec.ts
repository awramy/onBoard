import { AiService } from './ai.service';
import type { GeminiProvider } from './providers/gemini.provider';
import type { OpenAiProvider } from './providers/openai.provider';

function createMockProvider(overrides: {
  name: string;
  modelId: string;
  isAvailable: () => boolean;
}): GeminiProvider & OpenAiProvider {
  return {
    name: overrides.name,
    modelId: overrides.modelId,
    isAvailable: overrides.isAvailable,
    evaluateAnswer: jest.fn(),
    generateQuestionText: jest.fn(),
  } as unknown as GeminiProvider & OpenAiProvider;
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

    const service = new AiService(gemini, openai);
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

    const service = new AiService(gemini, openai);
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

    const service = new AiService(gemini, openai);
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

    const service = new AiService(gemini, openai);
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

    const service = new AiService(gemini, openai);
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

    const service = new AiService(gemini, openai);
    expect(service.getProvider('auto').name).toBe('openai');
  });
});
