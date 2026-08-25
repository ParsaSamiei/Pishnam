import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PosterCategoryForm } from "@/components/admin/poster-category-form";
import { createPosterCategory } from "../actions";

export default async function NewPosterCategoryPage() {
  const [competitions, leagues] = await Promise.all([
    prisma.competition.findMany({ orderBy: { order: "asc" } }),
    prisma.league.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <Link
        href="/admin/poster-categories"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به دسته‌بندی پوستر
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن دسته‌بندی جدید</h1>
      <div className="mt-6">
        {leagues.length === 0 ? (
          <p className="text-text-secondary text-sm">
            ابتدا باید حداقل یک لیگ در بخش{" "}
            <Link href="/admin/leagues/new" className="text-pishnam-gold-600 underline">
              لیگ‌ها
            </Link>{" "}
            ثبت کنید.
          </p>
        ) : (
          <PosterCategoryForm
            action={createPosterCategory}
            submitLabel="ثبت"
            competitions={competitions.map((c) => ({ id: c.id, title: c.titleFa }))}
            leagues={leagues.map((l) => ({
              id: l.id,
              title: l.titleFa,
              competitionId: l.competitionId,
            }))}
          />
        )}
      </div>
    </div>
  );
}
