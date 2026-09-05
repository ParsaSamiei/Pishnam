-- AlterTable
ALTER TABLE "CourseTranslation" ADD COLUMN "pastResults" TEXT;
ALTER TABLE "CourseTranslation" ADD COLUMN "learningOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "CourseDocument" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
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

    CONSTRAINT "CourseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseDocument_courseId_order_idx" ON "CourseDocument"("courseId", "order");

-- CreateIndex
CREATE INDEX "CourseDocument_active_idx" ON "CourseDocument"("active");

-- AddForeignKey
ALTER TABLE "CourseDocument" ADD CONSTRAINT "CourseDocument_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
