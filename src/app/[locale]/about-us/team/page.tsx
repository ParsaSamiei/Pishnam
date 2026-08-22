import type { Metadata } from "next";
import Image from "next/image";
import { Users } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { buildAlternates } from "@/lib/i18n/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "fa" ? "پرسنل" : "Team",
    alternates: buildAlternates("/about-us/team"),
  };
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHeader
        title={isFa ? "پرسنل" : "Team"}
        subtitle={isFa ? "مربیان و اعضای تیم پیشنام." : "Pishnam's instructors and team members."}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {members.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "اطلاعات تیم به‌زودی منتشر می‌شود." : "Team info coming soon."}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => (
              <Card key={member.id} className="overflow-hidden p-0 text-center">
                <div className="bg-bg-surface-alt relative aspect-square w-full">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 240px, 50vw"
                    />
                  ) : (
                    <div className="text-text-secondary flex h-full items-center justify-center">
                      <Users className="size-8" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-text-primary font-bold">
                    {pickLocaleField(member.nameFa, member.nameEn, appLocale)}
                  </p>
                  <p className="text-pishnam-steel-600 mt-0.5 text-sm">
                    {pickLocaleField(member.roleFa, member.roleEn, appLocale)}
                  </p>
                  {pickLocaleField(member.bioFa, member.bioEn, appLocale) && (
                    <p className="text-text-secondary mt-2 line-clamp-3 text-xs">
                      {pickLocaleField(member.bioFa, member.bioEn, appLocale)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
