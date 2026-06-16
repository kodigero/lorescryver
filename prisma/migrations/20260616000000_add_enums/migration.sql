-- ============================================
-- Migration: Add enums and convert text columns
-- Handles both fresh DB and existing DB with TEXT columns
-- ============================================

-- 1. Create all enum types (idempotent)
DO $$ BEGIN CREATE TYPE "ProjectType" AS ENUM ('FOUNDATION', 'DELIVERY'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "DeliveryFormat" AS ENUM ('NOVEL', 'NOVELLA', 'SHORT_STORY', 'SCREENPLAY', 'TV_SERIES', 'WEB_SERIES', 'STAGE_PLAY', 'MUSICAL', 'VIDEO_GAME', 'VISUAL_NOVEL', 'ANIMATION', 'COMIC', 'MANGA', 'PODCAST', 'TABLETOP_RPG', 'INTERACTIVE_FICTION', 'POETRY', 'NONFICTION', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ProjectStatus" AS ENUM ('IDEATION', 'DRAFTING', 'REVISION', 'PUBLISHED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Phase" AS ENUM ('CONCEPT', 'CANDIDATE', 'CANON'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Stage" AS ENUM ('BRAINSTORM', 'RESEARCH', 'REFERENCE', 'CANON_STRESS_TEST', 'EXPANSION_STRESS_TEST', 'LOCKED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ChapterStatus" AS ENUM ('OUTLINE', 'DRAFT', 'REVISION', 'FINAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Project: add deliveryFormat column
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "deliveryFormat" "DeliveryFormat";

-- 3. Project: convert projectType (TEXT) → deliveryFormat + type (enum)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'projectType') THEN
    UPDATE "Project" SET "deliveryFormat" =
      CASE UPPER("projectType")
        WHEN 'NOVEL' THEN 'NOVEL'::"DeliveryFormat"
        WHEN 'NOVELLA' THEN 'NOVELLA'::"DeliveryFormat"
        WHEN 'SHORT_STORY' THEN 'SHORT_STORY'::"DeliveryFormat"
        WHEN 'SCREENPLAY' THEN 'SCREENPLAY'::"DeliveryFormat"
        WHEN 'TV_SERIES' THEN 'TV_SERIES'::"DeliveryFormat"
        WHEN 'WEB_SERIES' THEN 'WEB_SERIES'::"DeliveryFormat"
        WHEN 'STAGE_PLAY' THEN 'STAGE_PLAY'::"DeliveryFormat"
        WHEN 'MUSICAL' THEN 'MUSICAL'::"DeliveryFormat"
        WHEN 'VIDEO_GAME' THEN 'VIDEO_GAME'::"DeliveryFormat"
        WHEN 'VISUAL_NOVEL' THEN 'VISUAL_NOVEL'::"DeliveryFormat"
        WHEN 'ANIMATION' THEN 'ANIMATION'::"DeliveryFormat"
        WHEN 'COMIC' THEN 'COMIC'::"DeliveryFormat"
        WHEN 'MANGA' THEN 'MANGA'::"DeliveryFormat"
        WHEN 'PODCAST' THEN 'PODCAST'::"DeliveryFormat"
        WHEN 'TABLETOP_RPG' THEN 'TABLETOP_RPG'::"DeliveryFormat"
        WHEN 'INTERACTIVE_FICTION' THEN 'INTERACTIVE_FICTION'::"DeliveryFormat"
        WHEN 'POETRY' THEN 'POETRY'::"DeliveryFormat"
        WHEN 'NONFICTION' THEN 'NONFICTION'::"DeliveryFormat"
        WHEN 'OTHER' THEN 'OTHER'::"DeliveryFormat"
        ELSE 'NOVEL'::"DeliveryFormat"
      END
    WHERE "deliveryFormat" IS NULL AND "projectType" IS NOT NULL AND "projectType" != '';
    ALTER TABLE "Project" DROP COLUMN "projectType";
  END IF;
END $$;

-- 4. Project: add type column (ProjectType enum)
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "type" "ProjectType" NOT NULL DEFAULT 'FOUNDATION';

-- 5. Project: convert status (TEXT) → status (ProjectStatus enum)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Project' AND column_name = 'status' AND udt_name = 'text'
  ) THEN
    ALTER TABLE "Project" RENAME COLUMN "status" TO "status_old";
    ALTER TABLE "Project" ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'IDEATION';
    UPDATE "Project" SET "status" =
      CASE UPPER("status_old")
        WHEN 'IDEATION' THEN 'IDEATION'::"ProjectStatus"
        WHEN 'DRAFTING' THEN 'DRAFTING'::"ProjectStatus"
        WHEN 'REVISION' THEN 'REVISION'::"ProjectStatus"
        WHEN 'PUBLISHED' THEN 'PUBLISHED'::"ProjectStatus"
        ELSE 'IDEATION'::"ProjectStatus"
      END;
    ALTER TABLE "Project" DROP COLUMN "status_old";
  END IF;
END $$;

-- 6. Chapter: convert status (TEXT) → status (ChapterStatus enum)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Chapter' AND column_name = 'status' AND udt_name = 'text'
  ) THEN
    ALTER TABLE "Chapter" RENAME COLUMN "status" TO "status_old";
    ALTER TABLE "Chapter" ADD COLUMN "status" "ChapterStatus" NOT NULL DEFAULT 'OUTLINE';
    UPDATE "Chapter" SET "status" =
      CASE UPPER("status_old")
        WHEN 'OUTLINE' THEN 'OUTLINE'::"ChapterStatus"
        WHEN 'DRAFT' THEN 'DRAFT'::"ChapterStatus"
        WHEN 'REVISION' THEN 'REVISION'::"ChapterStatus"
        WHEN 'FINAL' THEN 'FINAL'::"ChapterStatus"
        ELSE 'OUTLINE'::"ChapterStatus"
      END;
    ALTER TABLE "Chapter" DROP COLUMN "status_old";
  END IF;
END $$;

-- 7. Create StagingConcept table if not exists
CREATE TABLE IF NOT EXISTS "StagingConcept" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Brainstorm',
    "summary" TEXT NOT NULL DEFAULT '',
    "phase" "Phase" NOT NULL DEFAULT 'CONCEPT',
    "stage" "Stage" NOT NULL DEFAULT 'BRAINSTORM',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StagingConcept_pkey" PRIMARY KEY ("id")
);

-- 8. StagingConcept: convert phase/stage if they are TEXT
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'StagingConcept' AND column_name = 'phase' AND udt_name = 'text'
  ) THEN
    ALTER TABLE "StagingConcept" RENAME COLUMN "phase" TO "phase_old";
    ALTER TABLE "StagingConcept" ADD COLUMN "phase" "Phase" NOT NULL DEFAULT 'CONCEPT';
    UPDATE "StagingConcept" SET "phase" =
      CASE UPPER("phase_old")
        WHEN 'CONCEPT' THEN 'CONCEPT'::"Phase"
        WHEN 'CANDIDATE' THEN 'CANDIDATE'::"Phase"
        WHEN 'CANON' THEN 'CANON'::"Phase"
        ELSE 'CONCEPT'::"Phase"
      END;
    ALTER TABLE "StagingConcept" DROP COLUMN "phase_old";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'StagingConcept' AND column_name = 'stage' AND udt_name = 'text'
  ) THEN
    ALTER TABLE "StagingConcept" RENAME COLUMN "stage" TO "stage_old";
    ALTER TABLE "StagingConcept" ADD COLUMN "stage" "Stage" NOT NULL DEFAULT 'BRAINSTORM';
    UPDATE "StagingConcept" SET "stage" =
      CASE UPPER("stage_old")
        WHEN 'BRAINSTORM' THEN 'BRAINSTORM'::"Stage"
        WHEN 'RESEARCH' THEN 'RESEARCH'::"Stage"
        WHEN 'REFERENCE' THEN 'REFERENCE'::"Stage"
        WHEN 'CANON_STRESS_TEST' THEN 'CANON_STRESS_TEST'::"Stage"
        WHEN 'EXPANSION_STRESS_TEST' THEN 'EXPANSION_STRESS_TEST'::"Stage"
        WHEN 'LOCKED' THEN 'LOCKED'::"Stage"
        ELSE 'BRAINSTORM'::"Stage"
      END;
    ALTER TABLE "StagingConcept" DROP COLUMN "stage_old";
  END IF;
END $$;

-- 9. Create indexes for StagingConcept
CREATE INDEX IF NOT EXISTS "StagingConcept_projectId_idx" ON "StagingConcept"("projectId");
CREATE INDEX IF NOT EXISTS "StagingConcept_projectId_phase_idx" ON "StagingConcept"("projectId", "phase");

-- 10. Add FK for StagingConcept
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StagingConcept_projectId_fkey') THEN
    ALTER TABLE "StagingConcept" ADD CONSTRAINT "StagingConcept_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
