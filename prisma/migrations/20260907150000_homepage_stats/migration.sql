-- CreateTable
CREATE TABLE "HomepageStats" (
    "id" TEXT NOT NULL,
    "boysEnrolled" INTEGER NOT NULL DEFAULT 0,
    "girlsEnrolled" INTEGER NOT NULL DEFAULT 0,
    "achievements" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageStats_pkey" PRIMARY KEY ("id")
);
