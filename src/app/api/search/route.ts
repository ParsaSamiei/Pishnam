import { NextRequest, NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { routing } from "@/lib/i18n/routing";
import { getCachedSearchIndex } from "@/lib/search/build-index";
import type { AppLocale } from "@/lib/i18n/routing";

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  if (!hasLocale(routing.locales, localeParam)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`search:${ip}`, 30, 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const hits = await getCachedSearchIndex(localeParam as AppLocale);
  return NextResponse.json({ hits });
}
