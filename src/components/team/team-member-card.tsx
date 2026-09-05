"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Download, FileText, Printer, Users } from "lucide-react";
import { useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  printLabel: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function printTeamMemberProfile({
  name,
  role,
  photo,
  bio,
  collaborationStartLabel,
  isAlumni,
  alumniLabel,
  locale,
}: {
  name: string;
  role: string;
  photo: string;
  bio: string | null;
  collaborationStartLabel: string | null;
  isAlumni: boolean;
  alumniLabel: string;
  locale: string;
}) {
  const printWindow = window.open("", "_blank", "width=720,height=900");
  if (!printWindow) return;
  printWindow.opener = null;

  const photoUrl = photo ? new URL(photo, window.location.origin).href : "";
  const dir = locale === "fa" ? "rtl" : "ltr";
  const lang = locale === "fa" ? "fa" : "en";

  printWindow.document.write(`<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(name)}</title>
  <style>
    @page { margin: 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Vazirmatn", "Inter", system-ui, sans-serif;
      color: #18222d;
      background: #fff;
      text-align: center;
    }
    .photo {
      width: 160px;
      height: 160px;
      margin: 0 auto 16px;
      border: 1px solid #dadad6;
      border-radius: 12px;
      overflow: hidden;
      background: #e8e8e5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .photo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .badge {
      display: inline-block;
      margin-bottom: 8px;
      padding: 2px 10px;
      border-radius: 999px;
      background: #18222d;
      color: #e6a817;
      font-size: 11px;
      font-weight: 600;
    }
    h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
    }
    .role {
      margin: 6px 0 0;
      color: #3b5e82;
      font-size: 15px;
    }
    .meta {
      margin: 8px 0 0;
      color: #4a5560;
      font-size: 12px;
    }
    .bio {
      margin: 20px auto 0;
      max-width: 36rem;
      color: #4a5560;
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-line;
      text-align: center;
    }
  </style>
</head>
<body>
  ${isAlumni ? `<div class="badge">${escapeHtml(alumniLabel)}</div>` : ""}
  <div class="photo">
    ${photoUrl ? `<img src="${escapeHtml(photoUrl)}" alt="" />` : ""}
  </div>
  <h1>${escapeHtml(name)}</h1>
  <p class="role">${escapeHtml(role)}</p>
  ${collaborationStartLabel ? `<p class="meta">${escapeHtml(collaborationStartLabel)}</p>` : ""}
  ${bio ? `<p class="bio">${escapeHtml(bio)}</p>` : ""}
</body>
</html>`);
  printWindow.document.close();

  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const img = printWindow.document.querySelector("img");
  if (img && !img.complete) {
    img.addEventListener("load", triggerPrint, { once: true });
    img.addEventListener("error", triggerPrint, { once: true });
    window.setTimeout(triggerPrint, 1500);
  } else {
    window.setTimeout(triggerPrint, 100);
  }
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
  printLabel,
}: TeamMemberCardProps) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;
  const hasDetails = Boolean(bio) || Boolean(resume);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <span className="bg-pishnam-navy-900 text-pishnam-gold-500 absolute start-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm ring-1 ring-white/20">
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
        <CardContent className="flex flex-col items-center p-4">
          <p className="text-text-primary font-bold">{name}</p>
          <p className="text-pishnam-steel-600 mt-0.5 text-sm">{role}</p>
          {collaborationStartLabel && (
            <p className="text-text-secondary mt-1.5 text-[11px]">{collaborationStartLabel}</p>
          )}
          {hasDetails && (
            <button
              type="button"
              className="text-pishnam-steel-600 hover:text-pishnam-gold-600 group/cta focus-visible:ring-pishnam-gold-500 mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm font-semibold transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={() => setOpen(true)}
            >
              <span className="relative">
                {learnMoreLabel}
                <span
                  aria-hidden="true"
                  className="from-pishnam-gold-500 to-steel-accent origin-inline-start rtl:origin-inline-end absolute inset-x-0 -bottom-0.5 h-0.5 scale-x-0 bg-linear-to-r transition-transform duration-300 group-hover/cta:scale-x-100 motion-reduce:transition-none rtl:bg-linear-to-l"
                />
              </span>
              <span className="shrink-0 transition-transform duration-300 motion-safe:group-hover/cta:translate-x-0.5 motion-reduce:transition-none rtl:motion-safe:group-hover/cta:-translate-x-0.5 [&_svg]:size-4">
                <ArrowIcon aria-hidden="true" />
              </span>
            </button>
          )}
        </CardContent>
      </Card>
      <DialogContent className="flex max-h-[min(90vh,36rem)] max-w-md flex-col overflow-hidden p-0 sm:max-w-lg">
        <div className="flex shrink-0 flex-col items-center px-6 pt-8 pb-4 text-center">
          <div className="bg-bg-surface-alt ring-border/60 relative aspect-square w-28 overflow-hidden rounded-xl shadow-sm ring-1 sm:w-32">
            {photo ? (
              <Image
                src={photo}
                alt=""
                width={128}
                height={128}
                className={cn("size-full object-contain", isAlumni && "opacity-90 grayscale-[30%]")}
              />
            ) : (
              <div className="text-text-secondary flex h-full items-center justify-center">
                <Users className="size-10" aria-hidden="true" />
              </div>
            )}
            {isAlumni && (
              <span className="bg-pishnam-navy-900 text-pishnam-gold-500 absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ring-1 ring-white/20">
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
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
            <p className="text-text-secondary text-center text-sm leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </div>
        )}
        <div className={cn("flex shrink-0 flex-col gap-2 px-6 pb-6", !bio && !resume && "pt-2")}>
          {resume && (
            <a
              href={resume}
              download
              className="bg-pishnam-gold-500 text-pishnam-navy-900 hover:bg-pishnam-gold-600 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <Download className="size-4" aria-hidden="true" />
              {downloadResumeLabel}
            </a>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              printTeamMemberProfile({
                name,
                role,
                photo,
                bio,
                collaborationStartLabel,
                isAlumni,
                alumniLabel,
                locale,
              })
            }
          >
            <Printer aria-hidden="true" />
            {printLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
