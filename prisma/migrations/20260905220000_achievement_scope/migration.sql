-- CreateEnum
CREATE TYPE "AchievementScope" AS ENUM ('NATIONAL', 'INTERNATIONAL');

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN "scope" "AchievementScope" NOT NULL DEFAULT 'NATIONAL';

-- CreateIndex
CREATE INDEX "Achievement_scope_idx" ON "Achievement"("scope");
