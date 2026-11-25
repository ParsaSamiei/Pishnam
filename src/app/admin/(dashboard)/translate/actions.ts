"use server";

import { requireAdminSession } from "@/lib/actions/admin-guard";
import { TranslateError, translateFaToEn } from "@/lib/free-translate";
import type { TranslateFormat } from "@/lib/translate-format";

export type TranslateFaToEnResult = { ok: true; text: string } | { ok: false; error: string };

export async function translateFaToEnAction(
  text: string,
  format: TranslateFormat = "text",
): Promise<TranslateFaToEnResult> {
  await requireAdminSession();

  if (typeof text !== "string") {
    return { ok: false, error: "متن نامعتبر است." };
  }
  if (format !== "text" && format !== "html") {
    return { ok: false, error: "فرمت ترجمه نامعتبر است." };
  }

  try {
    const translated = await translateFaToEn(text, format);
    return { ok: true, text: translated };
  } catch (error) {
    if (error instanceof TranslateError) {
      return { ok: false, error: error.message };
    }
    console.error("translateFaToEnAction failed", error);
    return { ok: false, error: "ترجمه انجام نشد. دوباره تلاش کنید." };
  }
}
