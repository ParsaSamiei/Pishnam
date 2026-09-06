-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "issuerFa" TEXT,
    "issuerEn" TEXT,
    "year" INTEGER,
    "image" TEXT NOT NULL,
    "descriptionFa" TEXT,
    "descriptionEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "License_active_order_idx" ON "License"("active", "order");
