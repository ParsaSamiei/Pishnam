-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "year" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosterCategory" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosterCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionPoster" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT,
    "descriptionEn" TEXT,
    "previewImage" TEXT NOT NULL,
    "source" "ResourceSource" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionPoster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Competition_slug_key" ON "Competition"("slug");

-- CreateIndex
CREATE INDEX "Competition_active_idx" ON "Competition"("active");

-- CreateIndex
CREATE INDEX "League_competitionId_idx" ON "League"("competitionId");

-- CreateIndex
CREATE INDEX "League_active_idx" ON "League"("active");

-- CreateIndex
CREATE UNIQUE INDEX "League_competitionId_slug_key" ON "League"("competitionId", "slug");

-- CreateIndex
CREATE INDEX "PosterCategory_leagueId_idx" ON "PosterCategory"("leagueId");

-- CreateIndex
CREATE INDEX "PosterCategory_active_idx" ON "PosterCategory"("active");

-- CreateIndex
CREATE UNIQUE INDEX "PosterCategory_leagueId_slug_key" ON "PosterCategory"("leagueId", "slug");

-- CreateIndex
CREATE INDEX "CompetitionPoster_categoryId_idx" ON "CompetitionPoster"("categoryId");

-- CreateIndex
CREATE INDEX "CompetitionPoster_active_idx" ON "CompetitionPoster"("active");

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosterCategory" ADD CONSTRAINT "PosterCategory_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionPoster" ADD CONSTRAINT "CompetitionPoster_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PosterCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate any legacy POSTERS DownloadResource rows into an Archive competition,
-- then drop them so the enum value can be removed safely.
DO $$
DECLARE
  poster_count INTEGER;
  competition_id TEXT;
  league_id TEXT;
  category_id TEXT;
  poster RECORD;
BEGIN
  SELECT COUNT(*) INTO poster_count FROM "DownloadResource" WHERE "category" = 'POSTERS';

  IF poster_count > 0 THEN
    competition_id := 'migrated_posters_competition';
    league_id := 'migrated_posters_league';
    category_id := 'migrated_posters_category';

    INSERT INTO "Competition" ("id", "slug", "titleFa", "titleEn", "order", "active", "updatedAt")
    VALUES (competition_id, 'archive', 'آرشیو', 'Archive', 999, true, CURRENT_TIMESTAMP);

    INSERT INTO "League" ("id", "competitionId", "slug", "titleFa", "titleEn", "order", "active", "updatedAt")
    VALUES (league_id, competition_id, 'general', 'عمومی', 'General', 0, true, CURRENT_TIMESTAMP);

    INSERT INTO "PosterCategory" ("id", "leagueId", "slug", "titleFa", "titleEn", "order", "active", "updatedAt")
    VALUES (category_id, league_id, 'uncategorized', 'بدون دسته', 'Uncategorized', 0, true, CURRENT_TIMESTAMP);

    FOR poster IN
      SELECT * FROM "DownloadResource" WHERE "category" = 'POSTERS'
    LOOP
      INSERT INTO "CompetitionPoster" (
        "id", "categoryId", "titleFa", "titleEn", "descriptionFa", "descriptionEn",
        "previewImage", "source", "fileUrl", "fileSizeBytes", "order", "active",
        "createdAt", "updatedAt"
      ) VALUES (
        poster."id",
        category_id,
        poster."titleFa",
        poster."titleEn",
        poster."descriptionFa",
        poster."descriptionEn",
        CASE
          WHEN poster."fileUrl" ~* '\.(jpe?g|png|webp)(\?|$)' THEN poster."fileUrl"
          ELSE '/uploads/poster-preview-placeholder.webp'
        END,
        poster."source",
        poster."fileUrl",
        poster."fileSizeBytes",
        0,
        true,
        poster."createdAt",
        CURRENT_TIMESTAMP
      );
    END LOOP;

    DELETE FROM "DownloadResource" WHERE "category" = 'POSTERS';
  END IF;
END $$;

-- Remove POSTERS from DownloadCategory enum (Postgres cannot DROP a single enum value).
CREATE TYPE "DownloadCategory_new" AS ENUM ('DATASHEETS', 'BOOKS', 'COMPONENT_LIBRARIES');

ALTER TABLE "DownloadResource"
  ALTER COLUMN "category" TYPE "DownloadCategory_new"
  USING ("category"::text::"DownloadCategory_new");

DROP TYPE "DownloadCategory";
ALTER TYPE "DownloadCategory_new" RENAME TO "DownloadCategory";
