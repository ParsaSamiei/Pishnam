import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

const EXPLORE_LINKS = [
  { href: "/courses", key: "courses" },
  { href: "/classes", key: "classes" },
  { href: "/videos", key: "videos" },
  { href: "/downloads", key: "downloads" },
  { href: "/blog", key: "blog" },
] as const;

const ABOUT_LINKS = [
  { href: "/about", key: "about" },
  { href: "/sponsors", key: "sponsors" },
  { href: "/schools", key: "schools" },
  { href: "/careers", key: "careers" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-pishnam-navy-900 text-pishnam-off-white border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
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
        </div>

        <div>
          <h3 className="text-pishnam-off-white/90 text-sm font-semibold">
            {t("footer.sections.explore")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-pishnam-off-white/70 hover:text-pishnam-gold-500 text-sm"
                >
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
                <Link
                  href={link.href}
                  className="text-pishnam-off-white/70 hover:text-pishnam-gold-500 text-sm"
                >
                  {t(`nav.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="text-pishnam-off-white/60 mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {year} {t("brand.fullName")} — {t("footer.rightsReserved")}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-pishnam-gold-500">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-pishnam-gold-500">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
