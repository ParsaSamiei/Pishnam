-- CreateTable
CREATE TABLE "MediaMention" (
    "id" TEXT NOT NULL,
    "outletNameFa" TEXT NOT NULL,
    "outletNameEn" TEXT NOT NULL,
    "headlineFa" TEXT NOT NULL,
    "headlineEn" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaMention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaMention_active_order_idx" ON "MediaMention"("active", "order");

-- CreateIndex
CREATE INDEX "MediaMention_publishedAt_idx" ON "MediaMention"("publishedAt");
