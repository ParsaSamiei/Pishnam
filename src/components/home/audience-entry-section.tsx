import { getLocale } from "next-intl/server";
import { GraduationCap, School, Handshake } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/routing";
import { getHomepageCopy } from "@/lib/homepage-content";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { AudienceEntryCard } from "./audience-entry-card";

export async function AudienceEntrySection() {
  const locale = (await getLocale()) as AppLocale;
  const { audiences } = await getHomepageCopy(locale);

  return (
    <section data-spine-node className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StaggerGroup className="max-w-2xl">
          <StaggerItem variant="heading">
            <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{audiences.title}</h2>
          </StaggerItem>
          <StaggerItem variant="rise">
            <p className="text-text-secondary mt-2">{audiences.subtitle}</p>
          </StaggerItem>
        </StaggerGroup>

        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StaggerItem className="h-full">
            <AudienceEntryCard
              href="/courses"
              icon={GraduationCap}
              title={audiences.parents.title}
              description={audiences.parents.description}
              cta={audiences.parents.cta}
              accent="gold"
            />
          </StaggerItem>
          <StaggerItem className="h-full">
            <AudienceEntryCard
              href="/schools"
              icon={School}
              title={audiences.schools.title}
              description={audiences.schools.description}
              cta={audiences.schools.cta}
              accent="steel"
            />
          </StaggerItem>
          <StaggerItem className="h-full">
            <AudienceEntryCard
              href="/sponsors"
              icon={Handshake}
              title={audiences.sponsors.title}
              description={audiences.sponsors.description}
              cta={audiences.sponsors.cta}
              accent="gold"
            />
          </StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  );
}
