import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LicenseForm } from "@/components/admin/license-form";
import { updateLicense } from "../../actions";

export default async function EditLicensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const license = await prisma.license.findUnique({ where: { id } });

  if (!license) {
    notFound();
  }

  const boundUpdate = updateLicense.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/licenses"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به مجوز‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش مجوز</h1>
      <div className="mt-6">
        <LicenseForm action={boundUpdate} defaultValues={license} submitLabel="ذخیره تغییرات" />
      </div>
    </div>
  );
}
