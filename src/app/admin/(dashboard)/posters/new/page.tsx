import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CompetitionPosterForm } from "@/components/admin/competition-poster-form";
import { createCompetitionPoster } from "../actions";

export default async function NewCompetitionPosterPage() {
  const [competitions, leagues, categories] = await Promise.all([
    prisma.competition.findMany({ orderBy: { order: "asc" } }),
    prisma.league.findMany({ orderBy: { order: "asc" } }),
    prisma.posterCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <Link
        href="/admin/posters"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به پوسترها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن پوستر جدید</h1>
      <div className="mt-6">
        {categories.length === 0 ? (
          <p className="text-text-secondary text-sm">
            ابتدا باید حداقل یک دسته‌بندی در بخش{" "}
            <Link href="/admin/poster-categories/new" className="text-pishnam-gold-600 underline">
              دسته‌بندی پوستر
            </Link>{" "}
            ثبت کنید.
          </p>
        ) : (
          <CompetitionPosterForm
            action={createCompetitionPoster}
            submitLabel="ثبت"
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
          />
        )}
      </div>
    </div>
  );
}
