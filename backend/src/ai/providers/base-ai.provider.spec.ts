import { Logger } from '@nestjs/common';
import { BaseAiProvider } from './base-ai.provider';

class TestAiProvider extends BaseAiProvider {
  readonly name = 'test';
  readonly modelId = 'test-model';
  protected readonly logger = new Logger(TestAiProvider.name);

  isAvailable(): boolean {
    return true;
  }

  evaluateAnswer() {
    return Promise.reject(new Error('Not implemented'));
  }

  generateQuestionText() {
    return Promise.reject(new Error('Not implemented'));
  }

  parse(text: string) {
    return this.parseEvaluationResponse(text);
  }

  finalizeQuestion(text: string) {
    return this.finalizeGeneratedQuestion(text);
  }
}

describe('BaseAiProvider response compaction', () => {
  const provider = new TestAiProvider();

  it('compacts verbose evaluation output', () => {
    const result = provider.parse(`{
      "score": 72,
      "feedback": "Good answer overall. It covers the core idea clearly. It also adds extra tutorial detail that should be trimmed.",
      "isFullyClosed": false,
      "recommendations": [
        "Mention headers and status codes in more detail than necessary",
        "Explain cookies and tokens for state management",
        "This third recommendation should be dropped"
      ]
    }`);

    expect(result.feedback).toBe(
      'Good answer overall. It covers the core idea clearly.',
    );
    expect(result.recommendations).toEqual([
      'Mention headers and status codes in more detail than necess…',
      'Explain cookies and tokens for state management',
    ]);
  });

  it('parses JSON wrapped in markdown fences (Gemini-style)', () => {
    const result = provider.parse(`\`\`\`json
{
  "score": 88,
  "feedback": "Covers the basics well.",
  "isFullyClosed": true,
  "recommendations": ["Add caching"]
}
\`\`\``);

    expect(result.score).toBe(88);
    expect(result.feedback).toBe('Covers the basics well.');
    expect(result.isFullyClosed).toBe(true);
    expect(result.recommendations).toEqual(['Add caching']);
  });

  it('parses JSON after a short preamble', () => {
    const result = provider.parse(`Here is the evaluation:
{"score": 55, "feedback": "Partial.", "isFullyClosed": false, "recommendations": []}`);

    expect(result.score).toBe(55);
    expect(result.feedback).toBe('Partial.');
  });

  it('reduces generated output to one concise question', () => {
    expect(
      provider.finalizeQuestion(
        'Explain the structure of an HTTP request and response. Also compare HTTP/1.1 and HTTP/2 in detail.\n- extra bullet',
      ),
    ).toBe('Explain the structure of an HTTP request and response.');
  });
});
