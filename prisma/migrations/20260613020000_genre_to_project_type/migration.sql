-- Rename genre column to projectType
ALTER TABLE "Project" RENAME COLUMN "genre" TO "projectType";

-- Set default value
ALTER TABLE "Project" ALTER COLUMN "projectType" SET DEFAULT 'novel';
