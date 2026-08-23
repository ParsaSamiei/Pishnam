import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SoftwareReleaseForm } from "@/components/admin/software-release-form";
import { createSoftwareRelease } from "../actions";

export default async function NewSoftwareReleasePage() {
  const products = await prisma.softwareProduct.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <Link
        href="/admin/software-releases"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به فایل‌های نرم‌افزار
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن فایل جدید</h1>
      <div className="mt-6">
        {products.length === 0 ? (
          <p className="text-text-secondary text-sm">
            ابتدا باید حداقل یک نرم‌افزار در بخش{" "}
            <Link href="/admin/software/new" className="text-pishnam-gold-600 underline">
              نرم‌افزار و افزونه‌ها
            </Link>{" "}
            ثبت کنید.
          </p>
        ) : (
          <SoftwareReleaseForm
            action={createSoftwareRelease}
            submitLabel="ثبت"
            products={products.map((p) => ({ id: p.id, title: p.titleFa }))}
          />
        )}
      </div>
    </div>
  );
}
