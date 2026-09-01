"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, FileText, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  viewProfileLabel: string;
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
  viewProfileLabel,
  downloadResumeLabel,
}: TeamMemberCardProps) {
  const [open, setOpen] = useState(false);
  const hasScrollableBody = Boolean(bio) || Boolean(resume);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full cursor-pointer text-start"
        aria-label={viewProfileLabel}
      >
        <Card
          className={cn(
            "overflow-hidden p-0 text-center",
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
            {bio && <p className="text-text-secondary mt-2 line-clamp-3 text-xs">{bio}</p>}
          </CardContent>
        </Card>
      </button>
      <DialogContent className="flex max-h-[min(90vh,36rem)] max-w-md flex-col overflow-hidden p-0 sm:max-w-lg">
        <div className="flex shrink-0 flex-col items-center px-6 pt-8 pb-4 text-center">
          <div className="bg-bg-surface-alt ring-border/60 relative aspect-square w-28 overflow-hidden rounded-xl shadow-sm ring-1 sm:w-32">
            {photo ? (
              <Image
                src={photo}
                alt=""
                fill
                className={cn("object-contain", isAlumni && "opacity-90 grayscale-[30%]")}
                sizes="128px"
              />
            ) : (
              <div className="text-text-secondary flex h-full items-center justify-center">
                <Users className="size-10" aria-hidden="true" />
              </div>
            )}
            {isAlumni && (
              <span className="bg-pishnam-navy-900/80 text-pishnam-gold-300 absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                {alumniLabel}
              </span>
            )}
          </div>
          <DialogHeader className="mt-4 items-center gap-1 text-center">
            <DialogTitle className="text-center">{name}</DialogTitle>
            <DialogDescription className="text-center">{role}</DialogDescription>
            {collaborationStartLabel && (
              <p className="text-text-secondary mt-1 text-xs">{collaborationStartLabel}</p>
            )}
          </DialogHeader>
        </div>
        {bio && (
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-6",
              hasScrollableBody && !resume ? "pb-6" : "pb-4",
            )}
          >
            <p className="text-text-secondary text-center text-sm leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </div>
        )}
        {resume && (
          <div className={cn("shrink-0 px-6", bio ? "pb-6" : "pt-2 pb-6")}>
            <a
              href={resume}
              download
              className="bg-pishnam-gold-500 text-pishnam-navy-900 hover:bg-pishnam-gold-600 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <Download className="size-4" aria-hidden="true" />
              {downloadResumeLabel}
            </a>
          </div>
        )}
        {!bio && !resume && <div className="pb-6" />}
      </DialogContent>
    </Dialog>
  );
}
