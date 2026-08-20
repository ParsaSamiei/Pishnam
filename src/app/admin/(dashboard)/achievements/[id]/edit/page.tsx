import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AchievementForm } from "@/components/admin/achievement-form";
import { updateAchievement } from "../../actions";

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const achievement = await prisma.achievement.findUnique({ where: { id } });

  if (!achievement) {
    notFound();
  }

  const boundUpdate = updateAchievement.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/achievements"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به افتخارات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش افتخار</h1>
      <div className="mt-6">
        <AchievementForm
          action={boundUpdate}
          defaultValues={achievement}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
