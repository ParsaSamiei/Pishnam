import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompetitionPosterForm } from "@/components/admin/competition-poster-form";
import { updateCompetitionPoster } from "../../actions";

export default async function EditCompetitionPosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [poster, competitions, leagues, categories] = await Promise.all([
    prisma.competitionPoster.findUnique({
      where: { id },
      include: {
        category: {
          include: { league: true },
        },
      },
    }),
    prisma.competition.findMany({ orderBy: { order: "asc" } }),
    prisma.league.findMany({ orderBy: { order: "asc" } }),
    prisma.posterCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!poster) {
    notFound();
  }

  const boundUpdate = updateCompetitionPoster.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/posters"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به پوسترها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش پوستر</h1>
      <div className="mt-6">
        <CompetitionPosterForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          competitions={competitions.map((c) => ({ id: c.id, title: c.titleFa }))}
          leagues={leagues.map((l) => ({
            id: l.id,
            title: l.titleFa,
            competitionId: l.competitionId,
          }))}
          categories={categories.map((c) => ({
            id: c.id,
            title: c.titleFa,
            leagueId: c.leagueId,
          }))}
          defaultValues={{
            competitionId: poster.category.league.competitionId,
            leagueId: poster.category.leagueId,
            categoryId: poster.categoryId,
            titleFa: poster.titleFa,
            titleEn: poster.titleEn,
            descriptionFa: poster.descriptionFa,
            descriptionEn: poster.descriptionEn,
            previewImage: poster.previewImage,
            source: poster.source,
            fileUrl: poster.fileUrl,
            fileSizeBytes: poster.fileSizeBytes,
            order: poster.order,
            active: poster.active,
          }}
        />
      </div>
    </div>
  );
}
