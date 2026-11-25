"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createLeadFormSchema, type LeadFormLocale } from "@/lib/validation/lead";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getEnrollmentGuidelines,
  getEnrollmentGuidelinesVersion,
  isEnrollmentGuidelinesGateActive,
} from "@/lib/enrollment-guidelines";
import {
  formActionError,
  formActionErrorWithMessage,
  type PreservedFormState,
} from "@/lib/form-state";

export type SubmitLeadState = PreservedFormState;

const METADATA_PREFIX = "metadata.";
const GUIDELINES_REQUIRED_TYPES = new Set(["ENROLL", "CLASS_SEAT"]);

export async function submitLead(
  _prevState: SubmitLeadState,
  formData: FormData,
): Promise<SubmitLeadState> {
  // Honeypot: a real visitor never sees or fills this field (see
  // LeadCaptureForm). If it's filled, silently report success rather than
  // telling the bot what tripped the check.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { status: "success" };
  }

  const locale: LeadFormLocale = formData.get("locale") === "en" ? "en" : "fa";

  const parsed = createLeadFormSchema(locale).safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return formActionError(errors, formData);
  }

  const enrollmentGuidelines = GUIDELINES_REQUIRED_TYPES.has(parsed.data.type)
    ? await getEnrollmentGuidelines()
    : null;
  const guidelinesGateActive = isEnrollmentGuidelinesGateActive(enrollmentGuidelines, locale);

  if (guidelinesGateActive && enrollmentGuidelines) {
    const acknowledged = formData.get("guidelinesAcknowledged");
    const submittedVersion = formData.get("guidelinesVersion");
    const currentVersion = getEnrollmentGuidelinesVersion(enrollmentGuidelines);

    if (acknowledged !== "true" || submittedVersion !== currentVersion) {
      return formActionErrorWithMessage(
        locale === "fa"
          ? "لطفاً راهنمای ثبت‌نام را بخوانید و تأیید کنید."
          : "Please read and acknowledge the enrollment guidelines before submitting.",
        formData,
      );
    }
  }

  const ip = getClientIp(await headers());
  const limitResult = rateLimit(`lead:${parsed.data.type}:${ip}`, 5, 10 * 60 * 1000);
  if (!limitResult.success) {
    return formActionErrorWithMessage(
      locale === "fa"
        ? "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید."
        : "Too many requests. Please try again in a few minutes.",
      formData,
    );
  }

  // Variant-specific extra fields (e.g. metadata.courseSlug, metadata.tier,
  // metadata.jobPostingId) are submitted as `metadata.<key>` form fields and
  // collected into the Lead.metadata JSON column here rather than needing a
  // schema change per lead type.
  const metadata: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith(METADATA_PREFIX) && typeof value === "string" && value.trim()) {
      metadata[key.slice(METADATA_PREFIX.length)] = value.trim();
    }
  }

  if (guidelinesGateActive && enrollmentGuidelines) {
    metadata.guidelinesVersion = getEnrollmentGuidelinesVersion(enrollmentGuidelines);
    metadata.guidelinesAcknowledged = "true";
  }

  await prisma.lead.create({
    data: {
      type: parsed.data.type,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      message: parsed.data.message || null,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    },
  });

  return { status: "success" };
}
