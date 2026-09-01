"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { feedbackFormSchema } from "@/lib/validation/feedback";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  formActionError,
  formActionErrorWithMessage,
  type PreservedFormState,
} from "@/lib/form-state";

export type SubmitFeedbackState = PreservedFormState;

export async function submitFeedback(
  _prevState: SubmitFeedbackState,
  formData: FormData,
): Promise<SubmitFeedbackState> {
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { status: "success" };
  }

  const parsed = feedbackFormSchema.safeParse({
    name: formData.get("name"),
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

  const ip = getClientIp(await headers());
  const limitResult = rateLimit(`feedback:${ip}`, 5, 10 * 60 * 1000);
  if (!limitResult.success) {
    return formActionErrorWithMessage(
      "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.",
      formData,
    );
  }

  await prisma.feedback.create({
    data: {
      name: parsed.data.name,
      message: parsed.data.message,
    },
  });

  return { status: "success" };
}
