import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FaqForm } from "@/components/admin/faq-form";
import { updateFaq } from "../../actions";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faq = await prisma.faq.findUnique({ where: { id } });

  if (!faq) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/faqs"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به سوالات متداول
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش سوال</h1>
      <div className="mt-6">
        <FaqForm
          action={updateFaq.bind(null, id)}
          defaultValues={faq}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
