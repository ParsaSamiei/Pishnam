"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LanguageSwitch() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const nextLocale = locale === "fa" ? "en" : "fa";

  function handleSwitch() {
    // `track` isn't required here -- the language_switch analytics event
    // (docs/09-analytics-i18n.md) is fired from the AnalyticsProvider on
    // pathname/locale change, not from this handler directly.
    router.replace(
      // @ts-expect-error -- params shape is dynamic per-route, next-intl types this loosely
      { pathname, params },
      { locale: nextLocale },
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleSwitch}
      aria-label={t("toggle")}
      className="w-auto cursor-pointer px-3 font-semibold"
    >
      {nextLocale === "fa" ? t("fa") : t("en")}
    </Button>
  );
}
