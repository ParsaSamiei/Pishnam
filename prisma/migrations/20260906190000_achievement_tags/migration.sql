-- CreateTable
CREATE TABLE "AchievementTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AchievementTag_pkey" PRIMARY KEY ("id")
);

-- Seed the two labels that used to live on enum AchievementScope.
INSERT INTO "AchievementTag" ("id", "slug", "nameFa", "nameEn", "order", "active", "createdAt", "updatedAt")
VALUES
    ('cmtaginternational0000001', 'international', 'جهانی', 'International', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cmtagnational000000000001', 'national', 'کشوری', 'National', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN "tagId" TEXT;

UPDATE "Achievement" SET "tagId" = 'cmtaginternational0000001' WHERE "scope" = 'INTERNATIONAL';
UPDATE "Achievement" SET "tagId" = 'cmtagnational000000000001' WHERE "scope" = 'NATIONAL' OR "tagId" IS NULL;

ALTER TABLE "Achievement" ALTER COLUMN "tagId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AchievementTag_slug_key" ON "AchievementTag"("slug");

-- CreateIndex
CREATE INDEX "AchievementTag_active_order_idx" ON "AchievementTag"("active", "order");

-- CreateIndex
CREATE INDEX "Achievement_tagId_idx" ON "Achievement"("tagId");

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "AchievementTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropIndex
DROP INDEX "Achievement_scope_idx";

-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "scope";

-- DropEnum
DROP TYPE "AchievementScope";
