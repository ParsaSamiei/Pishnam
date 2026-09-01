-- AlterTable
ALTER TABLE "VideoEntry" ADD COLUMN "hostedVideo" TEXT;
ALTER TABLE "VideoEntry" ALTER COLUMN "aparatUrl" DROP NOT NULL;
