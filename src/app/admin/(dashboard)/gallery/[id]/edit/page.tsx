import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryImageForm } from "@/components/admin/gallery-image-form";
import { updateGalleryImage } from "../../actions";

export default async function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const image = await prisma.galleryImage.findUnique({ where: { id } });

  if (!image) {
    notFound();
  }

  const boundUpdate = updateGalleryImage.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/gallery"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به گالری
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش تصویر</h1>
      <div className="mt-6">
        <GalleryImageForm action={boundUpdate} defaultValues={image} submitLabel="ذخیره تغییرات" />
      </div>
    </div>
  );
}
