-- CreateTable
CREATE TABLE "EnrollmentGuidelines" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "titleFa" TEXT NOT NULL DEFAULT 'راهنمای ثبت‌نام',
    "titleEn" TEXT NOT NULL DEFAULT 'Before you apply',
    "introFa" TEXT NOT NULL DEFAULT 'لطفاً موارد زیر را با دقت بخوانید تا از شرایط کلاس‌ها و قوانین پیشنام آگاه شوید.',
    "introEn" TEXT NOT NULL DEFAULT 'Please read the following so you know what to expect from Pishnam classes and how we work together.',
    "bodyFa" TEXT NOT NULL DEFAULT '',
    "bodyEn" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentGuidelines_pkey" PRIMARY KEY ("id")
);
