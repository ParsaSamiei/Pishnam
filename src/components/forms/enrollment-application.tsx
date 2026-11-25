"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { EnrollmentGuidelines } from "@prisma/client";
import { BookOpen, ChevronDown } from "lucide-react";
import { RichText } from "@/components/rich-text";
import { LeadCaptureForm, type LeadExtraField } from "@/components/forms/lead-capture-form";
import { getEnrollmentGuidelinesVersion } from "@/lib/enrollment-guidelines.shared";
import type { LeadTypeValue } from "@/lib/validation/lead";
import type { AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface EnrollmentApplicationProps {
  locale: "fa" | "en";
  guidelines: EnrollmentGuidelines;
  leadType: LeadTypeValue;
  analyticsEvent: AnalyticsEvent;
  submitLabel: string;
  extraFields?: LeadExtraField[];
  successTitle: string;
  successBody?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
}

const COPY = {
  fa: {
    eyebrow: "پیش از ثبت‌نام",
    progress: "پیشرفت مطالعه",
    readingTime: (minutes: number) => `حدود ${minutes} دقیقه مطالعه`,
    scrollHint: "تا انتهای راهنما اسکرول کنید",
    acknowledge: "راهنمای بالا را خواندم و با شرایط کلاس‌ها و قوانین پیشنام آگاه هستم.",
    formHeading: "فرم درخواست",
    formLocked: "پس از مطالعهٔ راهنما و تأیید، فرم باز می‌شود.",
    formReady: "اکنون می‌توانید فرم را پر کنید.",
  },
  en: {
    eyebrow: "Before you apply",
    progress: "Reading progress",
    readingTime: (minutes: number) => `About ${minutes} min read`,
    scrollHint: "Scroll to the end of the guidelines",
    acknowledge:
      "I have read the guidelines above and understand Pishnam's class expectations and policies.",
    formHeading: "Your request",
    formLocked: "Complete the guidelines above to unlock the form.",
    formReady: "You can now fill out the form below.",
  },
} as const;

function estimateReadingMinutes(html: string, locale: "fa" | "en"): number {
  const text = html.replace(/<[^>]*>/g, " ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = locale === "fa" ? 170 : 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

const subscribeNowhere = () => () => {};

/** False during SSR / hydration; true after the client commits. */
function useIsClient() {
  return useSyncExternalStore(
    subscribeNowhere,
    () => true,
    () => false,
  );
}

export function EnrollmentApplication({
  locale,
  guidelines,
  leadType,
  analyticsEvent,
  submitLabel,
  extraFields,
  successTitle,
  successBody,
  messageLabel,
  messagePlaceholder,
}: EnrollmentApplicationProps) {
  const copy = COPY[locale];
  const title = locale === "fa" ? guidelines.titleFa : guidelines.titleEn;
  const intro = locale === "fa" ? guidelines.introFa : guidelines.introEn;
  const body = locale === "fa" ? guidelines.bodyFa : guidelines.bodyEn;
  const version = getEnrollmentGuidelinesVersion(guidelines);
  const readingMinutes = estimateReadingMinutes(body, locale);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 8) {
      setScrollProgress(1);
      setHasReachedEnd(true);
      return;
    }

    const progress = Math.min(1, scrollTop / maxScroll);
    setScrollProgress(progress);
    setHasReachedEnd(progress >= 0.92);
  }, []);

  useEffect(() => {
    updateScrollState();
    const element = scrollRef.current;
    if (!element) return;

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateScrollState, body]);

  const checkboxLocked = !isClient || !hasReachedEnd;
  const canApply = isClient && hasReachedEnd && acknowledged;

  return (
    <div className="flex flex-col gap-10">
      <section
        aria-labelledby="enrollment-guidelines-heading"
        className="border-border bg-bg-surface overflow-hidden rounded-2xl border shadow-sm"
      >
        <div className="border-border border-b px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span
              className="bg-pishnam-gold-500/15 text-pishnam-gold-600 flex size-10 shrink-0 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <BookOpen className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-pishnam-steel-600 text-xs font-semibold tracking-wide uppercase">
                {copy.eyebrow}
              </p>
              <h2
                id="enrollment-guidelines-heading"
                className="text-text-primary mt-1 text-xl font-bold sm:text-2xl"
              >
                {title}
              </h2>
              {intro ? (
                <p className="reading-copy text-text-secondary mt-2 text-sm leading-relaxed">
                  {intro}
                </p>
              ) : null}
              <p className="text-text-secondary mt-2 text-xs">{copy.readingTime(readingMinutes)}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary">{copy.progress}</span>
              <span className="text-text-secondary tabular-nums">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>
            <div
              className="bg-bg-surface-alt h-1.5 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(scrollProgress * 100)}
              aria-label={copy.progress}
            >
              <div
                className="bg-pishnam-gold-500 h-full rounded-full transition-[width] duration-200 ease-out"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="max-h-[min(22rem,50vh)] [scrollbar-width:thin] overflow-y-auto scroll-smooth px-5 py-5 sm:max-h-[min(32rem,62vh)] sm:px-6 sm:py-6"
          >
            <RichText
              html={body}
              className={cn(
                "reading-copy text-[0.9375rem] leading-[1.75] sm:text-[0.95rem]",
                "[&_h2]:border-border [&_h2]:mt-8 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:first:mt-0",
                "[&_h3]:text-pishnam-steel-600 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold",
                "[&_ol]:space-y-2.5 [&_ol]:ps-5 sm:[&_ol]:ps-6",
                "[&_ul]:space-y-2 [&_ul]:ps-5 sm:[&_ul]:ps-6",
                "[&_li]:ps-0.5 [&_li]:leading-relaxed",
                "[&_p+p]:mt-0",
              )}
            />
          </div>

          {!isClient || !hasReachedEnd ? (
            <div
              aria-hidden="true"
              className="from-bg-surface pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-linear-to-t to-transparent pb-2"
            >
              <span className="text-text-secondary bg-bg-surface/90 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs shadow-sm">
                <ChevronDown className="size-3.5" aria-hidden="true" />
                {copy.scrollHint}
              </span>
            </div>
          ) : null}
        </div>

        <div className="border-border bg-bg-surface-alt border-t px-5 py-4 sm:px-6">
          <label
            className={cn(
              "flex items-start gap-3",
              checkboxLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            )}
          >
            <input
              type="checkbox"
              checked={acknowledged}
              disabled={checkboxLocked}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="border-border text-pishnam-steel-600 mt-0.5 size-4 shrink-0 rounded disabled:cursor-not-allowed"
            />
            <span className="reading-copy text-text-primary text-sm leading-relaxed">
              {copy.acknowledge}
            </span>
          </label>
        </div>
      </section>

      <section
        aria-labelledby="enrollment-form-heading"
        className={cn("transition-opacity duration-300", canApply ? "opacity-100" : "opacity-70")}
      >
        <h2 id="enrollment-form-heading" className="text-text-primary text-lg font-bold">
          {copy.formHeading}
        </h2>
        <p className="text-text-secondary mt-1 text-sm">
          {canApply ? copy.formReady : copy.formLocked}
        </p>

        <div
          className={cn("mt-6", !canApply && "pointer-events-none select-none")}
          aria-hidden={!canApply}
        >
          <LeadCaptureForm
            leadType={leadType}
            analyticsEvent={analyticsEvent}
            submitLabel={submitLabel}
            extraFields={extraFields}
            successTitle={successTitle}
            successBody={successBody}
            messageLabel={messageLabel}
            messagePlaceholder={messagePlaceholder}
            submitDisabled={!canApply}
            hiddenFields={{
              guidelinesAcknowledged: canApply ? "true" : "",
              guidelinesVersion: canApply ? version : "",
            }}
          />
        </div>
      </section>
    </div>
  );
}
