-- DropIndex: remove the JSONB-based unique index
DROP INDEX IF EXISTS "technology_name_en_key";

-- AlterTable: convert technology.name back from JSONB to VARCHAR(100)
-- If rows exist with JSONB data, extract the 'en' key; otherwise just cast
ALTER TABLE "technology"
  ALTER COLUMN "name" TYPE VARCHAR(100)
  USING COALESCE(name->>'en', name::text);

-- CreateIndex: restore the standard unique constraint
CREATE UNIQUE INDEX "technology_name_key" ON "technology" ("name");
