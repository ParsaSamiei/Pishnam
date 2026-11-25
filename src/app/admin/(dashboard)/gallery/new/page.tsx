import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GalleryImageForm } from "@/components/admin/gallery-image-form";
import { createGalleryImage } from "../actions";

export default async function NewGalleryImagePage() {
  const tags = await prisma.galleryTag.findMany({
    orderBy: { order: "asc" },
    select: { id: true, nameFa: true, nameEn: true, active: true },
  });

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
        <GalleryImageForm action={createGalleryImage} tags={tags} submitLabel="ثبت مورد" />
      </div>
    </div>
  );
}
