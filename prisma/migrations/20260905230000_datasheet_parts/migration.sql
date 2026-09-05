-- Datasheets & Docs split out of flat DownloadResource, matching how
-- SoftwareProduct left DownloadCategory.SOFTWARE. A part can be a stand-alone
-- module (SRF05) or a family with variants (LCD → 16x2). Nesting is two
-- levels; uniqueness is per sibling group (see partial unique indexes).

CREATE TABLE "DatasheetPart" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "image" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "excerptFa" TEXT,
    "excerptEn" TEXT,
    "bodyFa" TEXT,
    "bodyEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatasheetPart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatasheetDocument" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT,
    "descriptionEn" TEXT,
    "source" "ResourceSource" NOT NULL DEFAULT 'HOSTED',
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasheetDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatasheetVideo" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "aparatUrl" TEXT,
    "hostedVideo" TEXT,
    "thumbnail" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasheetVideo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatasheetImage" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "captionFa" TEXT,
    "captionEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasheetImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatasheetCodeSample" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "notesFa" TEXT,
    "notesEn" TEXT,
    "source" "ResourceSource",
    "fileUrl" TEXT,
    "fileSizeBytes" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasheetCodeSample_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DatasheetPart_slug_toplevel_key" ON "DatasheetPart" ("slug") WHERE "parentId" IS NULL;
CREATE UNIQUE INDEX "DatasheetPart_parentId_slug_key" ON "DatasheetPart" ("parentId", "slug") WHERE "parentId" IS NOT NULL;
CREATE INDEX "DatasheetPart_parentId_idx" ON "DatasheetPart"("parentId");
CREATE INDEX "DatasheetPart_active_order_idx" ON "DatasheetPart"("active", "order");
CREATE INDEX "DatasheetPart_slug_idx" ON "DatasheetPart"("slug");

CREATE INDEX "DatasheetDocument_partId_order_idx" ON "DatasheetDocument"("partId", "order");
CREATE INDEX "DatasheetDocument_active_idx" ON "DatasheetDocument"("active");

CREATE INDEX "DatasheetVideo_partId_order_idx" ON "DatasheetVideo"("partId", "order");
CREATE INDEX "DatasheetVideo_active_idx" ON "DatasheetVideo"("active");

CREATE INDEX "DatasheetImage_partId_order_idx" ON "DatasheetImage"("partId", "order");
CREATE INDEX "DatasheetImage_active_idx" ON "DatasheetImage"("active");

CREATE INDEX "DatasheetCodeSample_partId_order_idx" ON "DatasheetCodeSample"("partId", "order");
CREATE INDEX "DatasheetCodeSample_active_idx" ON "DatasheetCodeSample"("active");

ALTER TABLE "DatasheetPart" ADD CONSTRAINT "DatasheetPart_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DatasheetPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DatasheetDocument" ADD CONSTRAINT "DatasheetDocument_partId_fkey" FOREIGN KEY ("partId") REFERENCES "DatasheetPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DatasheetVideo" ADD CONSTRAINT "DatasheetVideo_partId_fkey" FOREIGN KEY ("partId") REFERENCES "DatasheetPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DatasheetImage" ADD CONSTRAINT "DatasheetImage_partId_fkey" FOREIGN KEY ("partId") REFERENCES "DatasheetPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DatasheetCodeSample" ADD CONSTRAINT "DatasheetCodeSample_partId_fkey" FOREIGN KEY ("partId") REFERENCES "DatasheetPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
