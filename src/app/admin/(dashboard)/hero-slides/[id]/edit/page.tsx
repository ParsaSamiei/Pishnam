import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { updateHeroSlide } from "../../actions";

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slide = await prisma.heroSlide.findUnique({ where: { id } });

  if (!slide) {
    notFound();
  }

  const boundUpdate = updateHeroSlide.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/hero-slides"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به تصاویر صفحه اصلی
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش تصویر</h1>
      <div className="mt-6">
        <HeroSlideForm action={boundUpdate} defaultValues={slide} submitLabel="ذخیره تغییرات" />
      </div>
    </div>
  );
}
