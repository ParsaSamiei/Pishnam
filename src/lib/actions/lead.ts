"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { leadFormSchema } from "@/lib/validation/lead";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export interface SubmitLeadState {
  status: "idle" | "success" | "error";
  errors?: Record<string, string>;
  message?: string;
}

const METADATA_PREFIX = "metadata.";

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

  const parsed = leadFormSchema.safeParse({
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
    return { status: "error", errors };
  }

  const ip = getClientIp(await headers());
  const limitResult = rateLimit(`lead:${parsed.data.type}:${ip}`, 5, 10 * 60 * 1000);
  if (!limitResult.success) {
    return {
      status: "error",
      message: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.",
    };
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
