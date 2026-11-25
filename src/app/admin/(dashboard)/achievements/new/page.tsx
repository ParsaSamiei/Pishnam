import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AchievementForm } from "@/components/admin/achievement-form";
import { createAchievement } from "../actions";

export default async function NewAchievementPage() {
  const tags = await prisma.achievementTag.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <Link
        href="/admin/achievements"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به افتخارات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن افتخار جدید</h1>
      <div className="mt-6">
        <AchievementForm action={createAchievement} tags={tags} submitLabel="ثبت افتخار" />
      </div>
    </div>
  );
}
