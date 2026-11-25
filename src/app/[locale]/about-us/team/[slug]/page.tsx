import { permanentRedirect } from "next/navigation";
import { routing } from "@/lib/i18n/routing";

export default async function TeamTagRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  permanentRedirect(`${prefix}/about-us/team#${slug}`);
}
