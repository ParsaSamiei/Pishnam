import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LicenseForm } from "@/components/admin/license-form";
import { createLicense } from "../actions";

export default function NewLicensePage() {
  return (
    <div>
      <Link
        href="/admin/licenses"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به مجوز‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن مجوز جدید</h1>
      <div className="mt-6">
        <LicenseForm action={createLicense} submitLabel="ثبت مجوز" />
      </div>
    </div>
  );
}
