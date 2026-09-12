import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { getHomepageCopy } from "@/lib/homepage-content";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { AnimatedLinkContent } from "@/components/motion/animated-link";
import { CardHoverRule, cardHoverClass, cardHoverIconClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";

/** Circuit-cup mark — transparent, theme-friendly gold trophy. */
function PishcupIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="pishcup-cup"
          x1="12"
          y1="6"
          x2="36"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f0c14d" />
          <stop offset="1" stopColor="#c9910e" />
        </linearGradient>
        <linearGradient
          id="pishcup-base"
          x1="16"
          y1="34"
          x2="32"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e6a817" />
          <stop offset="1" stopColor="#a87a0c" />
        </linearGradient>
      </defs>
      <path
        d="M12.5 12.5c-3.2 0-5.5 2.6-5.5 5.6 0 3.8 2.4 6.4 6.2 7.1"
        stroke="url(#pishcup-cup)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M35.5 12.5c3.2 0 5.5 2.6 5.5 5.6 0 3.8-2.4 6.4-6.2 7.1"
        stroke="url(#pishcup-cup)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M14 10.5h20c.6 0 1.1.5 1 1.1l-1.8 14.2c-.3 2.4-2.4 4.2-4.8 4.2h-8.8c-2.4 0-4.5-1.8-4.8-4.2L13 11.6c-.1-.6.4-1.1 1-1.1Z"
        fill="url(#pishcup-cup)"
      />
      <path
        d="M20 14.5v5.5l-2.5 2.5M24 14.5v9.5M28 14.5v5.5l2.5 2.5"
        stroke="#18222d"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <circle cx="17.5" cy="22.5" r="1.2" fill="#18222d" opacity="0.55" />
      <circle cx="24" cy="24" r="1.2" fill="#18222d" opacity="0.55" />
      <circle cx="30.5" cy="22.5" r="1.2" fill="#18222d" opacity="0.55" />
      <rect x="21.5" y="30" width="5" height="5" rx="1" fill="url(#pishcup-base)" />
      <path d="M16 39.5h16c1.1 0 2 .9 2 2v.5H14v-.5c0-1.1.9-2 2-2Z" fill="url(#pishcup-base)" />
      <rect x="18" y="36.5" width="12" height="3" rx="1" fill="url(#pishcup-base)" />
    </svg>
  );
}

/** Chat + node mark — transparent steel bubble with gold hub. */
function PishtalkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="pishtalk-bubble"
          x1="8"
          y1="8"
          x2="34"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6e8aa6" />
          <stop offset="1" stopColor="#3b5e82" />
        </linearGradient>
      </defs>
      <path
        d="M10 9.5h22c2.5 0 4.5 2 4.5 4.5v12c0 2.5-2 4.5-4.5 4.5H20.2L13.5 37.2V30.5H10c-2.5 0-4.5-2-4.5-4.5v-12c0-2.5 2-4.5 4.5-4.5Z"
        fill="url(#pishtalk-bubble)"
      />
      <rect x="14" y="17.5" width="14" height="6.5" rx="3.25" fill="#18222d" />
      <circle cx="18.2" cy="20.75" r="1.55" fill="#8fb0d0" />
      <circle cx="23.8" cy="20.75" r="1.55" fill="#8fb0d0" />
      <path
        d="M31.5 21h4.5M36 21l4-4.5M36 21l4 4.5"
        stroke="#e6a817"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="21" r="2.4" fill="#e6a817" />
      <circle cx="40.5" cy="16" r="1.7" fill="#6e8aa6" />
      <circle cx="40.5" cy="26" r="1.7" fill="#6e8aa6" />
    </svg>
  );
}

/** Workbench mark — steel bench with gold tools for the VIP workshop floor. */
function PishlabIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="pishlab-bench"
          x1="8"
          y1="14"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6e8aa6" />
          <stop offset="1" stopColor="#3b5e82" />
        </linearGradient>
        <linearGradient
          id="pishlab-tool"
          x1="28"
          y1="8"
          x2="40"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f0c14d" />
          <stop offset="1" stopColor="#c9910e" />
        </linearGradient>
      </defs>
      <rect x="7" y="26" width="34" height="5" rx="1.5" fill="url(#pishlab-bench)" />
      <path
        d="M11 31v8.5M37 31v8.5"
        stroke="url(#pishlab-bench)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="14"
        y="18"
        width="16"
        height="8"
        rx="1.5"
        fill="url(#pishlab-bench)"
        opacity="0.85"
      />
      <circle cx="18" cy="22" r="1.4" fill="#e6a817" />
      <circle cx="24" cy="22" r="1.4" fill="#e6a817" />
      <path
        d="M31 10.5l7 7M32.5 9l1.8 1.8M36.2 12.7l1.8 1.8"
        stroke="url(#pishlab-tool)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33.2 17.8l-4.2 4.2c-.4.4-1 .4-1.4 0l-.4-.4c-.4-.4-.4-1 0-1.4l4.2-4.2"
        fill="url(#pishlab-tool)"
      />
    </svg>
  );
}

const DESTINATIONS = [
  {
    href: "https://pishcup.com",
    key: "pishcup" as const,
    accent: "gold" as const,
    external: true,
    Icon: PishcupIcon,
  },
  {
    href: "https://pishtalk.com",
    key: "pishtalk" as const,
    accent: "steel" as const,
    external: true,
    Icon: PishtalkIcon,
  },
  {
    href: "/contact-us",
    key: "pishlab" as const,
    accent: "gold" as const,
    external: false,
    Icon: PishlabIcon,
  },
] as const;

/**
 * Mid-landing destinations for PishCup, Pishtalk, and PishLab. Same surface /
 * card / hover language as the audience grid so light and dark themes stay coherent.
 */
export async function RelatedSitesBanner() {
  const tNav = await getTranslations("nav");
  const locale = (await getLocale()) as AppLocale;
  const { related } = await getHomepageCopy(locale);
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  return (
    <section data-spine-node className="bg-bg-surface-alt py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StaggerGroup className="max-w-2xl">
          <StaggerItem variant="heading">
            <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{related.title}</h2>
          </StaggerItem>
          <StaggerItem variant="rise">
            <p className="text-text-secondary mt-2">{related.subtitle}</p>
          </StaggerItem>
        </StaggerGroup>

        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((site) => {
            const siteCopy = related[site.key];
            const Icon = site.Icon;
            const card = (
              <TiltCard className="h-full">
                <Card className={cn("h-full", cardHoverClass)}>
                  <CardHoverRule />
                  <CardContent className="flex h-full flex-col gap-5 p-6 sm:p-8">
                    <div
                      className={cn(
                        "flex size-18 shrink-0 items-center justify-center rounded-2xl sm:size-20",
                        cardHoverIconClass,
                        site.accent === "gold"
                          ? "bg-pishnam-gold-500/12 ring-pishnam-gold-500/25 ring-1"
                          : "bg-pishnam-steel-600/12 ring-pishnam-steel-600/25 ring-1",
                      )}
                    >
                      <Icon className="size-10 sm:size-11" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <p
                        className={cn(
                          "text-xs font-semibold tracking-wide uppercase",
                          site.accent === "gold" ? "text-pishnam-gold-600" : "text-steel-accent",
                        )}
                      >
                        {siteCopy.eyebrow}
                      </p>
                      <h3 className="text-text-primary mt-1 text-xl font-bold sm:text-2xl">
                        {siteCopy.title}
                      </h3>
                      <p className="text-text-secondary mt-2 text-sm leading-relaxed sm:text-base">
                        {siteCopy.description}
                      </p>
                      <div className="mt-4">
                        <AnimatedLinkContent
                          icon={
                            site.external ? (
                              <ExternalLink aria-hidden="true" />
                            ) : (
                              <ArrowIcon aria-hidden="true" />
                            )
                          }
                          className="font-semibold"
                        >
                          {siteCopy.cta}
                        </AnimatedLinkContent>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            );

            return (
              <StaggerItem key={site.key} className="h-full">
                {site.external ? (
                  <a
                    href={site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${siteCopy.title} (${tNav("opensInNewTab")})`}
                    className="group block h-full cursor-pointer"
                  >
                    {card}
                  </a>
                ) : (
                  <Link href={site.href} className="group block h-full cursor-pointer">
                    {card}
                  </Link>
                )}
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
