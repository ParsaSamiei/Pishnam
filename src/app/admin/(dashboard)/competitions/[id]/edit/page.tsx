import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompetitionForm } from "@/components/admin/competition-form";
import { updateCompetition } from "../../actions";

export default async function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const competition = await prisma.competition.findUnique({ where: { id } });

  if (!competition) {
    notFound();
  }

  const boundUpdate = updateCompetition.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/competitions"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به مسابقات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش مسابقه</h1>
      <div className="mt-6">
        <CompetitionForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          defaultValues={competition}
        />
      </div>
    </div>
  );
}
