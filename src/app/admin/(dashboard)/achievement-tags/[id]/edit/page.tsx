import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AchievementTagForm } from "@/components/admin/achievement-tag-form";
import { updateAchievementTag } from "../../actions";

export default async function EditAchievementTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await prisma.achievementTag.findUnique({ where: { id } });

  if (!tag) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/achievement-tags"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به برچسب افتخارات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش برچسب</h1>
      <div className="mt-6">
        <AchievementTagForm
          action={updateAchievementTag.bind(null, id)}
          defaultValues={tag}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
