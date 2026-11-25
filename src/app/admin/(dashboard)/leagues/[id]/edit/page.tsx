import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeagueForm } from "@/components/admin/league-form";
import { updateLeague } from "../../actions";

export default async function EditLeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [league, competitions] = await Promise.all([
    prisma.league.findUnique({ where: { id } }),
    prisma.competition.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!league) {
    notFound();
  }

  const boundUpdate = updateLeague.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/leagues"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به لیگ‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش لیگ</h1>
      <div className="mt-6">
        <LeagueForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          competitions={competitions.map((c) => ({ id: c.id, title: c.titleFa }))}
          defaultValues={league}
        />
      </div>
    </div>
  );
}
