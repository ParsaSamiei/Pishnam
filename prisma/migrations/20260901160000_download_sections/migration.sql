-- CreateEnum
CREATE TYPE "DownloadSectionType" AS ENUM ('SOFTWARE', 'POSTERS', 'DATASHEETS', 'BOOKS', 'COMPONENT_LIBRARIES');

-- CreateTable
CREATE TABLE "DownloadSection" (
    "id" TEXT NOT NULL,
    "sectionType" "DownloadSectionType" NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL DEFAULT 'file-text',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DownloadSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DownloadSection_sectionType_key" ON "DownloadSection"("sectionType");

-- CreateIndex
CREATE INDEX "DownloadSection_active_order_idx" ON "DownloadSection"("active", "order");

-- Seed the five default download-center tiles (same order as the former hardcoded list).
INSERT INTO "DownloadSection" ("id", "sectionType", "titleFa", "titleEn", "iconKey", "order", "active", "createdAt", "updatedAt") VALUES
  ('clseed000000000000000001', 'SOFTWARE', 'نرم‌افزار و افزونه‌ها', 'Software & Plugins', 'code-2', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clseed000000000000000002', 'POSTERS', 'پوستر مسابقات رباتیک', 'Competition Posters', 'trophy', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clseed000000000000000003', 'DATASHEETS', 'دیتاشیت و مستندات فنی', 'Datasheets & Docs', 'file-text', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clseed000000000000000004', 'BOOKS', 'کتاب و منابع آموزشی', 'Books & Resources', 'book-open', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clseed000000000000000005', 'COMPONENT_LIBRARIES', 'کتابخانه قطعات CAD', 'CAD Part Libraries', 'boxes', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
