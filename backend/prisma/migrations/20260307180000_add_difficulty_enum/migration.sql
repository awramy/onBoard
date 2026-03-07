-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('junior', 'middle', 'senior');

-- AlterTable: convert difficulty column from varchar to enum
ALTER TABLE "technology_level" ALTER COLUMN "difficulty" TYPE "Difficulty" USING "difficulty"::"Difficulty";
