import { useTranslations } from "next-intl";
import { GraduationCap, School, Handshake } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { AudienceEntryCard } from "./audience-entry-card";

export function AudienceEntrySection() {
  const t = useTranslations("home.audiences");

  return (
    <section data-spine-node className="bg-bg-surface-alt py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StaggerGroup className="max-w-2xl">
          <StaggerItem variant="heading">
            <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
          </StaggerItem>
          <StaggerItem variant="rise">
            <p className="text-text-secondary mt-2">{t("subtitle")}</p>
          </StaggerItem>
        </StaggerGroup>

        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StaggerItem className="h-full">
            <AudienceEntryCard
              href="/courses"
              icon={GraduationCap}
              title={t("parents.title")}
              description={t("parents.description")}
              cta={t("parents.cta")}
              accent="gold"
            />
          </StaggerItem>
          <StaggerItem className="h-full">
            <AudienceEntryCard
              href="/schools"
              icon={School}
              title={t("schools.title")}
              description={t("schools.description")}
              cta={t("schools.cta")}
              accent="steel"
            />
          </StaggerItem>
          <StaggerItem className="h-full">
            <AudienceEntryCard
              href="/sponsors"
              icon={Handshake}
              title={t("sponsors.title")}
              description={t("sponsors.description")}
              cta={t("sponsors.cta")}
              accent="gold"
            />
          </StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  );
}
