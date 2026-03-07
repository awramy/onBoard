-- AlterTable: revert interview_session_question.question_text from JSONB to TEXT
ALTER TABLE "interview_session_question"
  ALTER COLUMN "question_text" TYPE TEXT
  USING question_text::text;

-- AlterTable: revert interview_answer.ai_feedback from JSONB to TEXT
ALTER TABLE "interview_answer"
  ALTER COLUMN "ai_feedback" TYPE TEXT
  USING ai_feedback::text;
