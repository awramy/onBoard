export interface EvaluateAnswerContext {
  questionText: string;
  questionExplanation: string;
  answerText: string;
  previousAnswers?: { text: string; feedback: string; score: number }[];
  isDivide: boolean;
  currentMastery: number;
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

export const AI_PROVIDER = Symbol('AI_PROVIDER');

export interface AiProvider {
  readonly name: string;
  readonly modelId: string;
  evaluateAnswer(ctx: EvaluateAnswerContext): Promise<EvaluationResult>;
  generateQuestionText(ctx: GenerateQuestionContext): Promise<string>;
}

export const EVALUATION_SYSTEM_PROMPT = `You are a technical interview evaluator for software engineering topics.
You evaluate candidate answers to technical questions.

Respond ONLY with valid JSON matching this schema:
{
  "score": <number 0-100>,
  "feedback": "<detailed feedback in the same language as the answer>",
  "isFullyClosed": <boolean — true if the question is fully answered>,
  "recommendations": ["<suggestion 1>", "<suggestion 2>"]
}

Scoring guidelines:
- 0-20: Wrong or irrelevant answer
- 21-40: Partially correct but missing key concepts
- 41-60: Correct basic idea but lacks depth
- 61-80: Good answer with minor gaps
- 81-100: Excellent, comprehensive answer

If the question has isDivide=true, consider previous answers when evaluating completeness.
Set isFullyClosed=true only when the topic is comprehensively covered.`;

export const QUESTION_GEN_SYSTEM_PROMPT = `You are a technical interview question generator.
Given an original question, its explanation, and previous answer history, generate a follow-up question
that covers aspects the candidate has not yet demonstrated understanding of.

Respond with ONLY the question text, no extra formatting.
Keep the same language as the original question.`;
