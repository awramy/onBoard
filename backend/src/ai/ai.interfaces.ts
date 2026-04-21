export interface EvaluateAnswerContext {
  questionText: string;
  questionExplanation: string;
  answerText: string;
  previousAnswers?: { text: string; feedback: string; score: number }[];
  isDivide: boolean;
  currentMastery: number;
  difficulty?: string;
  questionDifficulty?: number;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  isFullyClosed: boolean;
  recommendations: string[];
}

export interface GenerateQuestionContext {
  originalQuestionText: string;
  explanation: string;
  previousAnswers: { text: string; feedback: string; score: number }[];
  currentMastery: number;
}

export type AiTestOperation = 'evaluate' | 'generate';

export interface AiProviderRegistration {
  name: string;
  modelId: string;
  aliases: string[];
  isDefault: boolean;
}

export interface AiModelTestResult {
  requestedModel: string;
  providerName: string;
  modelId: string;
  aliases: string[];
  operation: AiTestOperation;
  success: boolean;
  latencyMs: number;
  result?: EvaluationResult | string;
  error?: string;
}

export interface AiModelTestSummary {
  operation: AiTestOperation;
  total: number;
  passed: number;
  failed: number;
  results: AiModelTestResult[];
}

export interface AiProviderHealthSummary {
  hasProviders: boolean;
  providers: AiProviderRegistration[];
}

export interface AiProvider {
  readonly name: string;
  readonly modelId: string;
  evaluateAnswer(ctx: EvaluateAnswerContext): Promise<EvaluationResult>;
  generateQuestionText(ctx: GenerateQuestionContext): Promise<string>;
}

export const EVALUATION_SYSTEM_PROMPT = `You are a technical interview evaluator for software engineering topics.
You evaluate candidate answers to technical questions.
The candidate's level (Difficulty) and the question complexity (QuestionDifficulty 1-5) are provided in the user message.

Respond ONLY with valid JSON matching this schema:
{
  "score": <number 0-100>,
  "feedback": "<short feedback in the same language as the answer>",
  "isFullyClosed": <boolean — true if the question is fully answered>,
  "recommendations": ["<short action item 1>", "<short action item 2>"]
}

Level-aware scoring — calibrate your expectations to the candidate's level:
- junior: a correct core idea with at least one key detail (example, difference, or use-case) is a GOOD answer (70-85). Do NOT require nuances, edge-cases, or advanced related topics.
- middle: expect a more complete answer with important nuances. Standard scale applies.
- senior: expect deep understanding, edge-cases, trade-offs, and connections to related concepts.

General score ranges (after level calibration):
- 0-20: Wrong or irrelevant answer
- 21-40: Partially correct but missing key concepts for this level
- 41-60: Understands the basics but lacks expected depth for this level
- 61-80: Good answer with minor gaps for this level
- 81-100: Excellent answer that fully meets expectations for this level

Feedback rules:
- Keep feedback strictly within the scope of the question and the candidate's level.
- Do NOT suggest advanced or tangential topics that go beyond the question.
- For junior: acknowledge what is correct first, then mention only the most relevant missing piece.

isFullyClosed rules:
- Set isFullyClosed=true when the answer demonstrates sufficient understanding for the candidate's level.
- For junior: if score >= 70, the question should be considered fully closed — do not demand senior-depth coverage.
- For middle: if score >= 75 and no critical gaps remain.
- For senior: only when the topic is comprehensively covered with depth.
- If isDivide=true, consider cumulative coverage across all previous answers when deciding isFullyClosed.
Keep feedback to at most 2 short sentences.
Return 0-2 recommendations only.
Each recommendation must be brief, concrete, and no more than 8 words.
Do not restate the full question or provide tutorial-style explanations.
Output a single raw JSON object only — no markdown fences, no code blocks, no text before or after the JSON.`;

export const QUESTION_GEN_SYSTEM_PROMPT = `You are a technical interview question generator.
Given an original question, its explanation, and previous answer history, generate a follow-up question
that covers aspects the candidate has not yet demonstrated understanding of.

Respond with ONLY the question text, no extra formatting.
Keep the same language as the original question.
Return exactly one concise follow-up question.
Focus on the single biggest knowledge gap.
Keep it under 20 words and avoid multi-part questions.`;
