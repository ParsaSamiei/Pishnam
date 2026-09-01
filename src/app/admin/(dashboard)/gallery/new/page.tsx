import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GalleryImageForm } from "@/components/admin/gallery-image-form";
import { createGalleryImage } from "../actions";

export default function NewGalleryImagePage() {
  return (
    <div>
      <Link
        href="/admin/gallery"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به گالری
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن مورد جدید</h1>
      <div className="mt-6">
        <GalleryImageForm action={createGalleryImage} submitLabel="ثبت مورد" />
      </div>
    </div>
  );
}
