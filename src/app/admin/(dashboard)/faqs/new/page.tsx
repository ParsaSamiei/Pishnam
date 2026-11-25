import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaqForm } from "@/components/admin/faq-form";
import { createFaq } from "../actions";

export default function NewFaqPage() {
  return (
    <div>
      <Link
        href="/admin/faqs"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به سوالات متداول
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن سوال جدید</h1>
      <div className="mt-6">
        <FaqForm action={createFaq} submitLabel="ثبت سوال" />
      </div>
    </div>
  );
}
