import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DownloadSectionForm } from "@/components/admin/download-section-form";
import { createDownloadSection } from "../actions";
import { BUILTIN_SECTION_TYPES } from "@/lib/download-sections";
import type { DownloadSectionType } from "@prisma/client";

export default async function NewDownloadSectionPage() {
  const existing = await prisma.downloadSection.findMany({ select: { sectionType: true } });
  const usedBuiltinTypes = new Set(
    existing
      .map((row) => row.sectionType)
      .filter((type): type is DownloadSectionType => type !== "CUSTOM"),
  );
  const availableBuiltinTypes = BUILTIN_SECTION_TYPES.filter((type) => !usedBuiltinTypes.has(type));

  return (
    <div>
      <Link
        href="/admin/download-sections"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به بخش‌های مرکز دانلود
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن بخش جدید</h1>
      <div className="mt-6">
        <DownloadSectionForm
          action={createDownloadSection}
          availableBuiltinTypes={availableBuiltinTypes}
          submitLabel="ثبت بخش"
        />
      </div>
    </div>
  );
}
