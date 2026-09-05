"use client";

import Image from "next/image";
import { Download, FileText, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { CardHoverRule, cardHoverClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";

interface TeamMemberCardProps {
  name: string;
  role: string;
  photo: string;
  bio: string | null;
  resume: string | null;
  collaborationStartLabel: string | null;
  isAlumni: boolean;
  alumniLabel: string;
  learnMoreLabel: string;
  downloadResumeLabel: string;
}

export function TeamMemberCard({
  name,
  role,
  photo,
  bio,
  resume,
  collaborationStartLabel,
  isAlumni,
  alumniLabel,
  learnMoreLabel,
  downloadResumeLabel,
}: TeamMemberCardProps) {
  const hasDetails = Boolean(bio) || Boolean(resume);

  return (
    <Card
      className={cn(
        "group overflow-hidden p-0 text-center",
        cardHoverClass,
        isAlumni && "border-pishnam-steel-600/25 bg-bg-surface-alt/40",
      )}
    >
      <CardHoverRule />
      <div className="bg-bg-surface-alt relative aspect-square w-full">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            className={cn(
              "object-contain transition-transform duration-300 motion-safe:group-hover:scale-105",
              isAlumni && "opacity-85 grayscale-[35%]",
            )}
            sizes="(min-width: 1024px) 240px, 50vw"
          />
        ) : (
          <div className="text-text-secondary flex h-full items-center justify-center">
            <Users className="size-8" aria-hidden="true" />
          </div>
        )}
        {isAlumni && (
          <span className="bg-pishnam-navy-900/75 text-pishnam-gold-300 absolute start-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide">
            {alumniLabel}
          </span>
        )}
        {resume && (
          <span
            className="bg-bg-surface/90 text-pishnam-steel-600 ring-border/60 absolute end-3 bottom-3 flex size-7 items-center justify-center rounded-full shadow-sm ring-1"
            aria-hidden="true"
          >
            <FileText className="size-3.5" />
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <p className="text-text-primary font-bold">{name}</p>
        <p className="text-pishnam-steel-600 mt-0.5 text-sm">{role}</p>
        {collaborationStartLabel && (
          <p className="text-text-secondary mt-1.5 text-[11px]">{collaborationStartLabel}</p>
        )}
        {hasDetails && (
          <Accordion type="single" collapsible className="mt-3 w-full text-start">
            <AccordionItem value="bio" className="border-border border-t border-b-0">
              <AccordionTrigger className="text-pishnam-steel-600 hover:text-pishnam-navy-900 justify-center gap-1.5 py-2.5 text-xs font-semibold">
                {learnMoreLabel}
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                {bio && (
                  <p className="text-text-secondary text-center text-xs leading-relaxed whitespace-pre-line">
                    {bio}
                  </p>
                )}
                {resume && (
                  <a
                    href={resume}
                    download
                    className="bg-pishnam-gold-500 text-pishnam-navy-900 hover:bg-pishnam-gold-600 mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    {downloadResumeLabel}
                  </a>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
