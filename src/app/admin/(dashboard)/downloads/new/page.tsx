import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DownloadResourceForm } from "@/components/admin/download-resource-form";
import { createDownloadResource } from "../actions";

export default function NewDownloadResourcePage() {
  return (
    <div>
      <Link
        href="/admin/downloads"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به مرکز دانلود
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن مورد جدید</h1>
      <div className="mt-6">
        <DownloadResourceForm action={createDownloadResource} submitLabel="ثبت" />
      </div>
    </div>
  );
}
