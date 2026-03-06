-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "full_score" INTEGER NOT NULL DEFAULT 0,
    "league" VARCHAR(50) NOT NULL DEFAULT 'bronze',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technology" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technology_level" (
    "id" UUID NOT NULL,
    "technology_id" UUID NOT NULL,
    "difficulty" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technology_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technology_level_topic" (
    "technology_level_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,

    CONSTRAINT "technology_level_topic_pkey" PRIMARY KEY ("technology_level_id","topic_id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'theory',
    "difficulty" INTEGER NOT NULL,
    "explanation" TEXT,
    "is_devide" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_session" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "technology_level_id" UUID NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'planned',
    "total_questions" INTEGER,
    "current_order" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_session_question" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "question_id" UUID,
    "question_text" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_session_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_answer" (
    "id" UUID NOT NULL,
    "session_question_id" UUID NOT NULL,
    "answer_text" TEXT NOT NULL,
    "ai_feedback" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_question_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "attempts_count" INTEGER NOT NULL DEFAULT 0,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "last_score" INTEGER,
    "last_answered_at" TIMESTAMP(3),
    "mastery" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_question_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_topic_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "technology_name_key" ON "technology"("name");

-- CreateIndex
CREATE UNIQUE INDEX "technology_level_technology_id_difficulty_key" ON "technology_level"("technology_id", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "interview_session_question_session_id_order_key" ON "interview_session_question"("session_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "user_question_progress_user_id_question_id_key" ON "user_question_progress"("user_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_topic_progress_user_id_topic_id_key" ON "user_topic_progress"("user_id", "topic_id");

-- AddForeignKey
ALTER TABLE "technology_level" ADD CONSTRAINT "technology_level_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technology_level_topic" ADD CONSTRAINT "technology_level_topic_technology_level_id_fkey" FOREIGN KEY ("technology_level_id") REFERENCES "technology_level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technology_level_topic" ADD CONSTRAINT "technology_level_topic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_technology_level_id_fkey" FOREIGN KEY ("technology_level_id") REFERENCES "technology_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_session_question" ADD CONSTRAINT "interview_session_question_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_session_question" ADD CONSTRAINT "interview_session_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_answer" ADD CONSTRAINT "interview_answer_session_question_id_fkey" FOREIGN KEY ("session_question_id") REFERENCES "interview_session_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_question_progress" ADD CONSTRAINT "user_question_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_question_progress" ADD CONSTRAINT "user_question_progress_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
