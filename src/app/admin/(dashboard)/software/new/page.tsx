import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SoftwareProductForm } from "@/components/admin/software-product-form";
import { createSoftwareProduct } from "../actions";

export default function NewSoftwareProductPage() {
  return (
    <div>
      <Link
        href="/admin/software"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به نرم‌افزار و افزونه‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن نرم‌افزار جدید</h1>
      <div className="mt-6">
        <SoftwareProductForm action={createSoftwareProduct} submitLabel="ثبت" />
      </div>
    </div>
  );
}
