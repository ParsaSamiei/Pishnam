import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductTagForm } from "@/components/admin/product-tag-form";
import { createProductTag } from "../actions";

export default function NewProductTagPage() {
  return (
    <div>
      <Link
        href="/admin/product-tags"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به انواع محصول
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن نوع جدید</h1>
      <div className="mt-6">
        <ProductTagForm action={createProductTag} submitLabel="ثبت" />
      </div>
    </div>
  );
}
