-- CreateEnum
CREATE TYPE "GalleryMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN "mediaType" "GalleryMediaType" NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "GalleryImage" ADD COLUMN "video" TEXT;
ALTER TABLE "GalleryImage" ALTER COLUMN "image" DROP NOT NULL;
