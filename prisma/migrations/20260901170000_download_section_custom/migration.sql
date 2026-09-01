-- AlterEnum
ALTER TYPE "DownloadSectionType" ADD VALUE 'CUSTOM';

-- AlterTable: add slug, drop unique on sectionType
ALTER TABLE "DownloadSection" ADD COLUMN "slug" TEXT;

UPDATE "DownloadSection" SET "slug" = CASE "sectionType"
  WHEN 'SOFTWARE' THEN 'software'
  WHEN 'POSTERS' THEN 'posters'
  WHEN 'DATASHEETS' THEN 'datasheets'
  WHEN 'BOOKS' THEN 'books'
  WHEN 'COMPONENT_LIBRARIES' THEN 'component-libraries'
END;

ALTER TABLE "DownloadSection" ALTER COLUMN "slug" SET NOT NULL;

DROP INDEX "DownloadSection_sectionType_key";

CREATE UNIQUE INDEX "DownloadSection_slug_key" ON "DownloadSection"("slug");

CREATE INDEX "DownloadSection_sectionType_idx" ON "DownloadSection"("sectionType");

-- AlterTable: optional category + custom section link on download files
ALTER TABLE "DownloadResource" ADD COLUMN "sectionId" TEXT;
ALTER TABLE "DownloadResource" ALTER COLUMN "category" DROP NOT NULL;

ALTER TABLE "DownloadResource" ADD CONSTRAINT "DownloadResource_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "DownloadSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "DownloadResource_sectionId_idx" ON "DownloadResource"("sectionId");
