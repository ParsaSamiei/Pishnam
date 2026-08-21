import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { AchievementCard } from "./achievement-card";

export async function AchievementsHighlight() {
  const t = await getTranslations("home.achievements");
  const locale = (await getLocale()) as AppLocale;
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  const achievements = await prisma.achievement.findMany({
    where: { featured: true },
    orderBy: { year: "desc" },
    take: 4,
  });

  if (achievements.length === 0) {
    // No featured achievements yet -- admin hasn't added any. Section is
    // simply omitted rather than showing an empty shell to visitors.
    return null;
  }

  return (
    <section data-spine-node className="bg-bg-surface-alt py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <StaggerGroup>
            <StaggerItem variant="heading">
              <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
            </StaggerItem>
            <StaggerItem variant="rise">
              <p className="text-text-secondary mt-2">{t("subtitle")}</p>
            </StaggerItem>
          </StaggerGroup>
          <Reveal delay={0.2}>
            <Button asChild variant="link" className="gap-1.5">
              <Link href="/about/achievements">
                {t("viewAll")}
                <ArrowIcon className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement) => (
            <StaggerItem key={achievement.id} className="h-full">
              <AchievementCard
                title={pickLocaleField(achievement.titleFa, achievement.titleEn, locale)}
                competition={achievement.competition}
                year={achievement.year}
                result={achievement.result}
                photo={achievement.photo}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
