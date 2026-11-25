-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "resume" TEXT;
ALTER TABLE "TeamMember" ADD COLUMN "collaborationStartDate" TIMESTAMP(3);
ALTER TABLE "TeamMember" ADD COLUMN "isAlumni" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TeamMember" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
