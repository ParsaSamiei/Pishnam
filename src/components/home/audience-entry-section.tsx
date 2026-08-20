import { useTranslations } from "next-intl";
import { GraduationCap, School, Handshake } from "lucide-react";
import { AudienceEntryCard } from "./audience-entry-card";

export function AudienceEntrySection() {
  const t = useTranslations("home.audiences");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
        <p className="text-text-secondary mt-2">{t("subtitle")}</p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AudienceEntryCard
          href="/courses"
          icon={GraduationCap}
          title={t("parents.title")}
          description={t("parents.description")}
          cta={t("parents.cta")}
          accent="gold"
        />
        <AudienceEntryCard
          href="/schools"
          icon={School}
          title={t("schools.title")}
          description={t("schools.description")}
          cta={t("schools.cta")}
          accent="steel"
        />
        <AudienceEntryCard
          href="/sponsors"
          icon={Handshake}
          title={t("sponsors.title")}
          description={t("sponsors.description")}
          cta={t("sponsors.cta")}
          accent="gold"
        />
      </div>
    </section>
  );
}
