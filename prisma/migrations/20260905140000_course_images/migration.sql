-- CreateTable
CREATE TABLE "CourseImage" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "captionFa" TEXT,
    "captionEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseImage_courseId_order_idx" ON "CourseImage"("courseId", "order");

-- CreateIndex
CREATE INDEX "CourseImage_active_idx" ON "CourseImage"("active");

-- AddForeignKey
ALTER TABLE "CourseImage" ADD CONSTRAINT "CourseImage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
