import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }

  return {
    locale: requested,
    // Static/UI strings only (nav labels, buttons, form labels, errors) --
    // per docs/09-analytics-i18n.md, content-model strings (course bodies,
    // article bodies, etc.) live in the database via *Translation tables /
    // parallel *Fa/*En fields, NOT here.
    messages: (await import(`../../messages/${requested}.json`)).default,
  };
});
