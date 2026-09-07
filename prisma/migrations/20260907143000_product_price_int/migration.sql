-- AlterTable: replace free-text bilingual price with a numeric toman amount
ALTER TABLE "Product" ADD COLUMN "price" INTEGER;

UPDATE "Product" SET "price" = NULL;

ALTER TABLE "Product" DROP COLUMN IF EXISTS "priceFa";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "priceEn";
