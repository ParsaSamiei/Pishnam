import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TeamTagForm } from "@/components/admin/team-tag-form";
import { createTeamTag } from "../actions";

export default function NewTeamTagPage() {
  return (
    <div>
      <Link
        href="/admin/team-tags"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به دسته‌بندی پرسنل
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن دسته‌بندی جدید</h1>
      <div className="mt-6">
        <TeamTagForm action={createTeamTag} submitLabel="ثبت" />
      </div>
    </div>
  );
}
