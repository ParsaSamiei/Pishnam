import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LeagueForm } from "@/components/admin/league-form";
import { createLeague } from "../actions";

export default async function NewLeaguePage() {
  const competitions = await prisma.competition.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <Link
        href="/admin/leagues"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به لیگ‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن لیگ جدید</h1>
      <div className="mt-6">
        {competitions.length === 0 ? (
          <p className="text-text-secondary text-sm">
            ابتدا باید حداقل یک مسابقه در بخش{" "}
            <Link href="/admin/competitions/new" className="text-pishnam-gold-600 underline">
              مسابقات
            </Link>{" "}
            ثبت کنید.
          </p>
        ) : (
          <LeagueForm
            action={createLeague}
            submitLabel="ثبت"
            competitions={competitions.map((c) => ({ id: c.id, title: c.titleFa }))}
          />
        )}
      </div>
    </div>
  );
}
