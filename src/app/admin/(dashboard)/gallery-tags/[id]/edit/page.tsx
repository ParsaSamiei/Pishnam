import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryTagForm } from "@/components/admin/gallery-tag-form";
import { updateGalleryTag } from "../../actions";

export default async function EditGalleryTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tag = await prisma.galleryTag.findUnique({ where: { id } });

  if (!tag) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/gallery-tags"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به برچسب‌های گالری
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش برچسب گالری</h1>
      <div className="mt-6">
        <GalleryTagForm
          action={updateGalleryTag.bind(null, id)}
          defaultValues={tag}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
