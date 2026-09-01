import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { AnimatedLink } from "@/components/motion/animated-link";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { MediaMentionItem } from "@/components/press/media-mention-item";
import { MediaMentionPanel } from "@/components/press/media-mention-panel";

export async function MediaMentionsSection() {
  const t = await getTranslations("home.mediaMentions");
  const tPress = await getTranslations("press");
  const tNav = await getTranslations("nav");
  const locale = (await getLocale()) as AppLocale;
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  const [mentions, totalCount] = await Promise.all([
    prisma.mediaMention.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
      take: 4,
    }),
    prisma.mediaMention.count({ where: { active: true } }),
  ]);

  if (mentions.length === 0) return null;

  const showViewAll = totalCount > mentions.length;

  return (
    <section data-spine-node className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <StaggerGroup>
            <StaggerItem variant="heading">
              <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
            </StaggerItem>
            <StaggerItem variant="rise">
              <p className="text-text-secondary mt-2 max-w-2xl">{t("subtitle")}</p>
            </StaggerItem>
          </StaggerGroup>
          {showViewAll && (
            <Reveal delay={0.2}>
              <AnimatedLink href="/press" icon={<ArrowIcon aria-hidden="true" />}>
                {t("viewAll")}
              </AnimatedLink>
            </Reveal>
          )}
        </div>

        <StaggerGroup className="mx-auto mt-8 max-w-3xl">
          <StaggerItem>
            <MediaMentionPanel>
              {mentions.map((mention) => (
                <MediaMentionItem
                  key={mention.id}
                  outletName={pickLocaleField(mention.outletNameFa, mention.outletNameEn, locale)}
                  headline={pickLocaleField(mention.headlineFa, mention.headlineEn, locale)}
                  url={mention.url}
                  logo={mention.logo}
                  publishedAt={mention.publishedAt}
                  locale={locale}
                  opensInNewTabLabel={tNav("opensInNewTab")}
                  readLabel={tPress("read")}
                />
              ))}
            </MediaMentionPanel>
          </StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  );
}
