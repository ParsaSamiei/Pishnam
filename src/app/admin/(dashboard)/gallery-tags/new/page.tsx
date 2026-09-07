import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GalleryTagForm } from "@/components/admin/gallery-tag-form";
import { createGalleryTag } from "../actions";

export default function NewGalleryTagPage() {
  return (
    <div>
      <Link
        href="/admin/gallery-tags"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به برچسب‌های گالری
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن برچسب جدید</h1>
      <div className="mt-6">
        <GalleryTagForm action={createGalleryTag} submitLabel="ثبت" />
      </div>
    </div>
  );
}
