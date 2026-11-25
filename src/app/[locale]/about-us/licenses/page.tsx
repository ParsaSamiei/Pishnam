import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import { buildAlternates } from "@/lib/i18n/alternates";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { LicenseCertificate } from "@/components/licenses/license-certificate";

function localizedOptional(
  fa: string | null | undefined,
  en: string | null | undefined,
  locale: AppLocale,
): string | null {
  const primary = locale === "fa" ? fa : en;
  const fallback = locale === "fa" ? en : fa;
  return primary?.trim() || fallback?.trim() || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    alternates: buildAlternates("/about-us/licenses"),
    title: isFa ? "مجوز‌ها" : "Licenses & Permits",
    description: isFa
      ? "مجوزها و گواهی‌های رسمی پژوهشگران رباتیک پیشنام."
      : "Official licenses and permits held by Pishnam Robotics Researchers.",
  };
}

export default async function LicensesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const licenses = await prisma.license.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title={isFa ? "مجوز‌ها" : "Licenses & Permits"}
        subtitle={
          isFa
            ? "اسناد و مجوزهای رسمی که فعالیت آموزشی پیشنام را تأیید می‌کنند."
            : "Official documents that authorize Pishnam's educational work."
        }
      />

      <div className="relative overflow-hidden">
        {/* Soft steel wash — atmosphere without flat fill */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,94,130,0.12),transparent_55%),linear-gradient(180deg,transparent_0%,var(--bg-page)_100%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          {licenses.length === 0 ? (
            <p className="text-text-secondary text-center">
              {isFa ? "هنوز مجوزی ثبت نشده است." : "No licenses published yet."}
            </p>
          ) : (
            <StaggerGroup className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {licenses.map((license) => (
                <StaggerItem key={license.id}>
                  <LicenseCertificate
                    title={pickLocaleField(license.titleFa, license.titleEn, appLocale)}
                    issuer={localizedOptional(license.issuerFa, license.issuerEn, appLocale)}
                    year={license.year}
                    image={license.image}
                    description={localizedOptional(
                      license.descriptionFa,
                      license.descriptionEn,
                      appLocale,
                    )}
                    viewLabel={isFa ? "مشاهده" : "View"}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </div>
    </>
  );
}
