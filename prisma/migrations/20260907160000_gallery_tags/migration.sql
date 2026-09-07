-- CreateTable
CREATE TABLE "GalleryTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImageTag" (
    "imageId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "GalleryImageTag_pkey" PRIMARY KEY ("imageId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTag_slug_key" ON "GalleryTag"("slug");

-- CreateIndex
CREATE INDEX "GalleryTag_active_order_idx" ON "GalleryTag"("active", "order");

-- CreateIndex
CREATE INDEX "GalleryImageTag_tagId_idx" ON "GalleryImageTag"("tagId");

-- AddForeignKey
ALTER TABLE "GalleryImageTag" ADD CONSTRAINT "GalleryImageTag_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "GalleryImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImageTag" ADD CONSTRAINT "GalleryImageTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "GalleryTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
