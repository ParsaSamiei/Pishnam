import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="bg-pishnam-navy-900 text-pishnam-off-white relative overflow-hidden">
      {/* Subtle circuit-style backdrop -- purposeful color blocking per
          docs/03-design-system.md rather than a busy illustration. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-pishnam-gold-500) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <span className="bg-pishnam-gold-500/15 text-pishnam-gold-500 inline-block rounded-full px-3 py-1 text-xs font-semibold">
            {t("eyebrow")}
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="text-pishnam-off-white/75 mt-5 max-w-xl text-base sm:text-lg">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/courses">{t("ctaPrimary")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-pishnam-off-white border-white/25 hover:bg-white/10"
            >
              <Link href="/enroll">{t("ctaSecondary")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
