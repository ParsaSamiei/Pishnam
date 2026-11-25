import "server-only";

import type { TranslateFormat } from "@/lib/translate-format";

export type { TranslateFormat };

/** MyMemory free tier is ~500 bytes/request; Persian UTF-8 needs a low char budget. */
const CHUNK_CHARS = 180;
const MAX_CHARS = 30_000;
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

export class TranslateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranslateError";
  }
}

type MyMemoryResponse = {
  responseStatus?: number | string;
  responseData?: { translatedText?: string };
  quotaFinished?: boolean;
  exception_code?: string | number;
  responseDetails?: string;
};

/**
 * Free FA→EN translation via MyMemory (no billing / Cloud account).
 * Optional MYMEMORY_EMAIL raises the daily free quota.
 */
export async function translateFaToEn(
  text: string,
  format: TranslateFormat = "text",
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new TranslateError("متن فارسی خالی است.");
  }
  if (trimmed.length > MAX_CHARS) {
    throw new TranslateError(
      `متن طولانی‌تر از حد مجاز است (حداکثر ${MAX_CHARS.toLocaleString("fa-IR")} نویسه).`,
    );
  }

  if (format === "html") {
    const { masked, tags } = maskHtmlTags(trimmed);
    const translated = await translatePlainChunks(masked);
    return unmaskHtmlTags(translated, tags);
  }

  return translatePlainChunks(trimmed);
}

async function translatePlainChunks(text: string): Promise<string> {
  const chunks = splitIntoChunks(text, CHUNK_CHARS);
  const parts: string[] = [];

  for (const chunk of chunks) {
    parts.push(await translateChunk(chunk));
  }

  return parts.join("").trim();
}

async function translateChunk(text: string): Promise<string> {
  const url = new URL(MYMEMORY_URL);
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", "fa|en");

  const email = process.env.MYMEMORY_EMAIL?.trim();
  if (email) {
    url.searchParams.set("de", email);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  let payload: MyMemoryResponse;
  try {
    payload = (await response.json()) as MyMemoryResponse;
  } catch {
    throw new TranslateError("پاسخ سرویس ترجمه قابل خواندن نبود.");
  }

  const status = Number(payload.responseStatus);
  if (!response.ok || (status && status !== 200)) {
    if (payload.quotaFinished) {
      throw new TranslateError("سهمیه رایگان ترجمه امروز تمام شده است. فردا دوباره تلاش کنید.");
    }
    throw new TranslateError(
      payload.responseDetails?.trim() ||
        `خطا در سرویس ترجمه (کد ${response.status || status || "?"}).`,
    );
  }

  const translated = payload.responseData?.translatedText;
  if (typeof translated !== "string" || !translated.trim()) {
    throw new TranslateError("پاسخ ترجمه خالی بود.");
  }

  // MyMemory sometimes echoes "PLEASE SELECT TWO DISTINCT LANGUAGES" style errors
  // inside responseData with status 200.
  if (/INVALID SOURCE LANGUAGE|IS AN INVALID TARGET/i.test(translated)) {
    throw new TranslateError("سرویس ترجمه این زبان را پشتیبانی نکرد.");
  }

  return decodeBasicHtmlEntities(translated);
}

function splitIntoChunks(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxChars) {
    const window = remaining.slice(0, maxChars);
    const breakAt = Math.max(
      window.lastIndexOf("\n"),
      window.lastIndexOf(". "),
      window.lastIndexOf("。"),
      window.lastIndexOf("؟"),
      window.lastIndexOf("?"),
      window.lastIndexOf("!"),
      window.lastIndexOf(" "),
      window.lastIndexOf("،"),
    );

    const cut = breakAt > maxChars * 0.4 ? breakAt + 1 : maxChars;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

/** Keep markup intact by swapping tags for stable tokens before translation. */
function maskHtmlTags(html: string): { masked: string; tags: string[] } {
  const tags: string[] = [];
  const masked = html.replace(/<\/?[a-zA-Z][^>]*>/g, (tag) => {
    const index = tags.length;
    tags.push(tag);
    return `⟦T${index}⟧`;
  });
  return { masked, tags };
}

function unmaskHtmlTags(translated: string, tags: string[]): string {
  return translated.replace(/⟦\s*T\s*(\d+)\s*⟧/gi, (_match, index: string) => {
    return tags[Number(index)] ?? "";
  });
}

function decodeBasicHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
