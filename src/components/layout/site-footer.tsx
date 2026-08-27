import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { SocialChannelIcon } from "@/components/contact/social-channel-icon";
import { getContactSettings } from "@/lib/contact-settings";
import { Link } from "@/lib/i18n/navigation";
import { getSocialLinks } from "@/lib/social-channels";

function toTelHref(phone: string): string {
  const latin = phone.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  return `tel:${latin.replace(/[^\d+]/g, "")}`;
}

function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);
}

function toGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

const EXPLORE_LINKS = [
  { href: "/courses", key: "courses" },
  { href: "/classes", key: "classes" },
  { href: "/videos", key: "videos" },
  { href: "/downloads", key: "downloads" },
  { href: "/blog", key: "blog" },
] as const;

const ABOUT_LINKS = [
  { href: "/about-us", key: "about" },
  { href: "/sponsors", key: "sponsors" },
  { href: "/schools", key: "schools" },
  // { href: "/careers", key: "careers" },
  { href: "/contact-us", key: "contact" },
  { href: "/feedback", key: "feedback" },
] as const;

const RELATED_LINKS = [
  {
    href: "https://pishcup.com",
    key: "pishcup",
    blurbKey: "pishcupBlurb",
  },
  {
    href: "https://pishtalk.com",
    key: "pishtalk",
    blurbKey: "pishtalkBlurb",
  },
] as const;

const footerLinkClass =
  "text-pishnam-off-white/70 hover:text-pishnam-gold-500 cursor-pointer text-sm transition-colors duration-200";

export async function SiteFooter() {
  const t = await getTranslations();
  const locale = await getLocale();
  const isFa = locale === "fa";
  const year = new Date().getFullYear();
  const settings = await getContactSettings();
  const socialLinks = getSocialLinks(settings);
  const address =
    (isFa ? settings?.addressFa : settings?.addressEn) ||
    (isFa ? settings?.addressEn : settings?.addressFa) ||
    null;
  const mapsQuery = settings?.addressEn || settings?.addressFa || address;
  const phones = settings?.phones ?? [];

  return (
    <footer className="border-border bg-pishnam-navy-900 text-pishnam-off-white border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/pishnam-logo.png"
              alt={t("brand.fullName")}
              width={36}
              height={40}
              className="h-9 w-auto"
            />
            <span className="text-base font-bold">{t("brand.name")}</span>
          </div>
          <p className="text-pishnam-off-white/70 mt-3 max-w-sm text-sm">{t("footer.tagline")}</p>
          {address && mapsQuery ? (
            <a
              href={toGoogleMapsUrl(mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${address} (${t("nav.opensInNewTab")})`}
              className="text-pishnam-off-white/60 hover:text-pishnam-gold-500 mt-3 flex max-w-sm cursor-pointer items-start gap-1.5 text-sm leading-snug transition-colors duration-200"
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden="true" />
              <span className="whitespace-pre-line">{address}</span>
            </a>
          ) : null}
          {phones.length > 0 ? (
            <ul className="text-pishnam-off-white/60 mt-2 flex max-w-sm flex-col gap-1.5 text-sm">
              {phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={toTelHref(phone)}
                    className="hover:text-pishnam-gold-500 inline-flex cursor-pointer items-center gap-1.5 transition-colors duration-200"
                  >
                    <Phone className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
                    <span dir="ltr">{isFa ? toPersianDigits(phone) : phone}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h3 className="text-pishnam-off-white/90 text-sm font-semibold">
            {t("footer.sections.explore")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
                  {t(`nav.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-pishnam-off-white/90 text-sm font-semibold">
            {t("footer.sections.about")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {ABOUT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
                  {t(`nav.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-pishnam-off-white/90 text-sm font-semibold">
            {t("footer.sections.related")}
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {RELATED_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t(`nav.${link.key}`)} (${t("nav.opensInNewTab")})`}
                  className={`${footerLinkClass} group inline-flex items-start gap-1.5`}
                >
                  <span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      {t(`nav.${link.key}`)}
                      <ExternalLink
                        className="size-3.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug opacity-80">
                      {t(`footer.${link.blurbKey}`)}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {socialLinks.length > 0 ? (
            <div className="mt-6 border-t border-white/10 pt-3">
              <p className="text-pishnam-off-white/45 text-xs leading-none">{t("footer.follow")}</p>
              <ul className="mt-1.5 flex flex-wrap items-center gap-0.5">
                {socialLinks.map((link) => {
                  const label = isFa ? link.labelFa : link.labelEn;
                  return (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${label} (${t("nav.opensInNewTab")})`}
                        className="text-pishnam-off-white/50 hover:text-pishnam-gold-500 inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-200"
                      >
                        <SocialChannelIcon id={link.id} className="size-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="text-pishnam-off-white/60 mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {year} {t("brand.fullName")} — {t("footer.rightsReserved")}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-pishnam-gold-500 cursor-pointer">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-pishnam-gold-500 cursor-pointer">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
