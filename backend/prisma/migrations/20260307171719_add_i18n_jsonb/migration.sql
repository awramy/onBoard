-- DropIndex
DROP INDEX IF EXISTS "technology_name_key";

-- AlterTable: technology
ALTER TABLE "technology" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable: topic
ALTER TABLE "topic" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable: question
ALTER TABLE "question" DROP COLUMN "text",
ADD COLUMN     "text" JSONB NOT NULL,
DROP COLUMN "explanation",
ADD COLUMN     "explanation" JSONB;

-- AlterTable: interview_session_question
ALTER TABLE "interview_session_question" DROP COLUMN "question_text",
ADD COLUMN     "question_text" JSONB NOT NULL;

-- CreateIndex: unique technology name by English locale
CREATE UNIQUE INDEX "technology_name_en_key" ON "technology" ((name->>'en'));
