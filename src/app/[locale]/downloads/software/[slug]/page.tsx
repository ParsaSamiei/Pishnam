import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/i18n/alternates";
import { formatFileSize } from "@/lib/format";
import { getSoftwarePlatform, softwarePlatformLabel } from "@/lib/software-platforms";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass, cardHoverIconClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";
import { ReleaseDownloadButton } from "@/components/software/release-download-button";

async function getProduct(slug: string) {
  return prisma.softwareProduct.findUnique({
    where: { slug, active: true },
    include: { releases: { orderBy: [{ platform: "asc" }, { order: "asc" }] } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const appLocale = locale as AppLocale;
  const product = await getProduct(slug);
  if (!product) return {};

  const title = pickLocaleField(product.titleFa, product.titleEn, appLocale);
  const description =
    pickLocaleField(product.descriptionFa, product.descriptionEn, appLocale) ?? undefined;

  return {
    alternates: buildAlternates(`/downloads/software/${slug}`),
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: product.image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function SoftwareProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const product = await getProduct(slug);
  if (!product) {
    notFound();
  }

  const title = pickLocaleField(product.titleFa, product.titleEn, appLocale);
  const description = pickLocaleField(product.descriptionFa, product.descriptionEn, appLocale);

  return (
    <>
      <div className="bg-pishnam-navy-900 relative h-64 w-full sm:h-80">
        <Image
          src={product.image}
          alt=""
          fill
          className="object-cover opacity-70"
          sizes="100vw"
          priority
        />
        <div className="from-pishnam-navy-900 via-pishnam-navy-900/40 absolute inset-0 flex items-end bg-linear-to-t to-transparent">
          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-pishnam-off-white text-2xl font-extrabold sm:text-3xl">{title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {description && <p className="text-text-secondary max-w-2xl">{description}</p>}

        <h2 className="text-text-primary mt-8 text-lg font-bold">
          {isFa ? "دانلود" : "Downloads"}
        </h2>

        {product.releases.length === 0 ? (
          <p className="text-text-secondary mt-3">
            {isFa
              ? "هنوز فایلی برای این نرم‌افزار ثبت نشده است."
              : "No files have been added for this software yet."}
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {product.releases.map((release) => {
              const isExternal = release.source === "EXTERNAL";
              const platform = getSoftwarePlatform(release.platform);
              const PlatformIcon = platform?.icon;
              const notes = pickLocaleField(release.notesFa, release.notesEn, appLocale);

              return (
                <TiltCard key={release.id} tilt={false}>
                  <Card className={cardHoverClass}>
                    <CardHoverRule />
                    <CardContent className="flex items-center gap-4 p-5">
                      <div
                        className={cn(
                          "bg-pishnam-gold-500/15 text-pishnam-gold-600 flex size-11 shrink-0 items-center justify-center rounded-lg",
                          cardHoverIconClass,
                        )}
                      >
                        {PlatformIcon && <PlatformIcon className="size-5" aria-hidden="true" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-text-primary font-bold">
                          {softwarePlatformLabel(release.platform, appLocale)}{" "}
                          <span className="text-text-secondary font-normal" dir="ltr">
                            {release.versionLabel}
                          </span>
                        </p>
                        {notes && (
                          <p className="text-text-secondary mt-0.5 line-clamp-2 text-sm">{notes}</p>
                        )}
                        {!isExternal && release.fileSizeBytes && (
                          <p className="text-text-secondary mt-1 text-xs">
                            {formatFileSize(release.fileSizeBytes)}
                          </p>
                        )}
                      </div>
                      <ReleaseDownloadButton
                        href={release.fileUrl}
                        isExternal={isExternal}
                        productTitle={title}
                        platformLabel={softwarePlatformLabel(release.platform, appLocale)}
                        versionLabel={release.versionLabel}
                        label={
                          isExternal ? (isFa ? "مشاهده" : "Visit") : isFa ? "دانلود" : "Download"
                        }
                      />
                    </CardContent>
                  </Card>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
