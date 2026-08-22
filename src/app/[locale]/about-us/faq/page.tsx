import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { buildAlternates } from "@/lib/i18n/alternates";
import { JsonLd } from "@/components/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "fa" ? "سوالات متداول" : "FAQ",
    alternates: buildAlternates("/about-us/faq"),
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const faqs = await prisma.faq.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });

  const grouped = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const list = grouped.get(faq.category) ?? [];
    list.push(faq);
    grouped.set(faq.category, list);
  }

  return (
    <>
      {faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: pickLocaleField(faq.questionFa, faq.questionEn, appLocale),
              acceptedAnswer: {
                "@type": "Answer",
                text: pickLocaleField(faq.answerFa, faq.answerEn, appLocale),
              },
            })),
          }}
        />
      )}
      <PageHeader
        title={isFa ? "سوالات متداول" : "FAQ"}
        subtitle={
          isFa
            ? "پاسخ به پرسش‌های رایج درباره دوره‌ها و ثبت‌نام."
            : "Answers to common questions about courses and enrollment."
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        {faqs.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "سوالی ثبت نشده است." : "No FAQs added yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-text-primary mb-2 text-lg font-bold">{category}</h2>
                <Accordion type="single" collapsible>
                  {items.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger>
                        {pickLocaleField(faq.questionFa, faq.questionEn, appLocale)}
                      </AccordionTrigger>
                      <AccordionContent>
                        {pickLocaleField(faq.answerFa, faq.answerEn, appLocale)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
