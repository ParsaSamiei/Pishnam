-- Contact details can hold any number of addresses. Move the singleton's
-- single address into one ordered row so existing sites keep their location.

-- CreateTable
CREATE TABLE "ContactAddress" (
    "id" TEXT NOT NULL,
    "contactSettingsId" TEXT NOT NULL,
    "addressFa" TEXT,
    "addressEn" TEXT,
    "postalCode" TEXT,
    "mapEmbedUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactAddress_contactSettingsId_order_idx" ON "ContactAddress"("contactSettingsId", "order");

-- Migrate the existing address (if any) into the new collection.
INSERT INTO "ContactAddress" (
    "id", "contactSettingsId", "addressFa", "addressEn", "postalCode",
    "mapEmbedUrl", "order", "createdAt", "updatedAt"
)
SELECT
    'default-address', "id", "addressFa", "addressEn", "postalCode",
    "mapEmbedUrl", 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "ContactSettings"
WHERE "id" = 'default'
  AND (
      "addressFa" IS NOT NULL
      OR "addressEn" IS NOT NULL
      OR "postalCode" IS NOT NULL
      OR "mapEmbedUrl" IS NOT NULL
  );

-- AlterTable
ALTER TABLE "ContactSettings"
    DROP COLUMN "addressFa",
    DROP COLUMN "addressEn",
    DROP COLUMN "postalCode",
    DROP COLUMN "mapEmbedUrl";

-- AddForeignKey
ALTER TABLE "ContactAddress" ADD CONSTRAINT "ContactAddress_contactSettingsId_fkey"
    FOREIGN KEY ("contactSettingsId") REFERENCES "ContactSettings"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
