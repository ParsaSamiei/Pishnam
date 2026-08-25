import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CompetitionForm } from "@/components/admin/competition-form";
import { createCompetition } from "../actions";

export default function NewCompetitionPage() {
  return (
    <div>
      <Link
        href="/admin/competitions"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به مسابقات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن مسابقه جدید</h1>
      <div className="mt-6">
        <CompetitionForm action={createCompetition} submitLabel="ثبت" />
      </div>
    </div>
  );
}
