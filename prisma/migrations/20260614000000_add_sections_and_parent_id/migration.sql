-- CreateTable
CREATE TABLE IF NOT EXISTS "ProjectSection" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSection_pkey" PRIMARY KEY ("id")
);

-- Add parentId to Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "parentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectSection_projectId_key_key" ON "ProjectSection"("projectId", "key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProjectSection_projectId_idx" ON "ProjectSection"("projectId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Project_parentId_idx" ON "Project"("parentId");

-- AddForeignKey (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Project_parentId_fkey') THEN
    ALTER TABLE "Project" ADD CONSTRAINT "Project_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProjectSection_projectId_fkey') THEN
    ALTER TABLE "ProjectSection" ADD CONSTRAINT "ProjectSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
