-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" TEXT NOT NULL,
    "copy" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);
