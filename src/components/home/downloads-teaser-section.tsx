import { getTranslations, getLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AppLocale } from "@/lib/i18n/routing";
import { DOWNLOAD_CATEGORIES } from "@/lib/download-categories";

export async function DownloadsTeaserSection() {
  const t = await getTranslations("home.downloads");
  const locale = (await getLocale()) as AppLocale;
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
          <p className="text-text-secondary mt-2 max-w-xl">{t("subtitle")}</p>
        </div>
        <Button asChild variant="link" className="gap-1.5">
          <Link href="/downloads">
            {t("viewAll")}
            <ArrowIcon className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {DOWNLOAD_CATEGORIES.map(({ slug, icon: Icon, labelFa, labelEn }) => (
          <Link key={slug} href={`/downloads/${slug}`}>
            <Card className="flex h-full flex-col items-start gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="bg-pishnam-steel-600/15 text-pishnam-steel-600 flex size-10 items-center justify-center rounded-lg">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <span className="text-text-primary text-sm font-semibold">
                {locale === "fa" ? labelFa : labelEn}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
