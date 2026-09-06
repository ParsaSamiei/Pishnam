import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AchievementTagForm } from "@/components/admin/achievement-tag-form";
import { createAchievementTag } from "../actions";

export default function NewAchievementTagPage() {
  return (
    <div>
      <Link
        href="/admin/achievement-tags"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به برچسب افتخارات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن برچسب جدید</h1>
      <div className="mt-6">
        <AchievementTagForm action={createAchievementTag} submitLabel="ثبت" />
      </div>
    </div>
  );
}
