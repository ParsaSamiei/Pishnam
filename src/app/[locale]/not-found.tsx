import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { NotFoundView } from "@/components/errors/not-found-view";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function NotFoundPage() {
  const locale = await resolveRequestLocale();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundView locale={locale} />
    </NextIntlClientProvider>
  );
}
