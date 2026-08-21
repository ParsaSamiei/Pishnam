import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { createHeroSlide } from "../actions";

export default function NewHeroSlidePage() {
  return (
    <div>
      <Link
        href="/admin/hero-slides"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به تصاویر صفحه اصلی
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن تصویر جدید</h1>
      <div className="mt-6">
        <HeroSlideForm action={createHeroSlide} submitLabel="ثبت تصویر" />
      </div>
    </div>
  );
}
