import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PosterCategoryForm } from "@/components/admin/poster-category-form";
import { updatePosterCategory } from "../../actions";

export default async function EditPosterCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, competitions, leagues] = await Promise.all([
    prisma.posterCategory.findUnique({
      where: { id },
      include: { league: true },
    }),
    prisma.competition.findMany({ orderBy: { order: "asc" } }),
    prisma.league.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!category) {
    notFound();
  }

  const boundUpdate = updatePosterCategory.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/poster-categories"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به دسته‌بندی پوستر
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش دسته‌بندی</h1>
      <div className="mt-6">
        <PosterCategoryForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          competitions={competitions.map((c) => ({ id: c.id, title: c.titleFa }))}
          leagues={leagues.map((l) => ({
            id: l.id,
            title: l.titleFa,
            competitionId: l.competitionId,
          }))}
          defaultValues={{
            competitionId: category.league.competitionId,
            leagueId: category.leagueId,
            slug: category.slug,
            titleFa: category.titleFa,
            titleEn: category.titleEn,
            order: category.order,
            active: category.active,
          }}
        />
      </div>
    </div>
  );
}
