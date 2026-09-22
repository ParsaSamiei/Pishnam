-- AlterTable
ALTER TABLE "HomepageStats" ADD COLUMN "boysLabelFa" TEXT NOT NULL DEFAULT 'پسران ثبت‌نام‌شده';
ALTER TABLE "HomepageStats" ADD COLUMN "boysLabelEn" TEXT NOT NULL DEFAULT 'Boys enrolled';
ALTER TABLE "HomepageStats" ADD COLUMN "girlsLabelFa" TEXT NOT NULL DEFAULT 'دختران ثبت‌نام‌شده';
ALTER TABLE "HomepageStats" ADD COLUMN "girlsLabelEn" TEXT NOT NULL DEFAULT 'Girls enrolled';
ALTER TABLE "HomepageStats" ADD COLUMN "achievementsLabelFa" TEXT NOT NULL DEFAULT 'افتخارات';
ALTER TABLE "HomepageStats" ADD COLUMN "achievementsLabelEn" TEXT NOT NULL DEFAULT 'Achievements';
