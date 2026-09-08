import { z } from "zod";

const requiredText = (label: string, max: number) =>
  z
    .string({ required_error: `${label} الزامی است.` })
    .trim()
    .min(1, `${label} الزامی است.`)
    .max(max, `${label} خیلی طولانی است.`);

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} خیلی طولانی است.`);

const bilingualCard = (label: string) =>
  z.object({
    titleFa: requiredText(`${label} — عنوان فارسی`, 120),
    titleEn: requiredText(`${label} — English title`, 120),
    descriptionFa: requiredText(`${label} — توضیح فارسی`, 500),
    descriptionEn: requiredText(`${label} — English description`, 500),
    ctaFa: requiredText(`${label} — دکمه فارسی`, 80),
    ctaEn: requiredText(`${label} — English CTA`, 80),
  });

const sectionHeading = (label: string) =>
  z.object({
    titleFa: requiredText(`${label} — عنوان فارسی`, 120),
    titleEn: requiredText(`${label} — English title`, 120),
    subtitleFa: requiredText(`${label} — توضیح فارسی`, 400),
    subtitleEn: requiredText(`${label} — English subtitle`, 400),
    viewAllFa: requiredText(`${label} — لینک «مشاهده همه» فارسی`, 80),
    viewAllEn: requiredText(`${label} — English view-all link`, 80),
  });

const relatedSite = (label: string) =>
  z.object({
    eyebrowFa: requiredText(`${label} — برچسب فارسی`, 60),
    eyebrowEn: requiredText(`${label} — English eyebrow`, 60),
    titleFa: requiredText(`${label} — عنوان فارسی`, 80),
    titleEn: requiredText(`${label} — English title`, 80),
    descriptionFa: requiredText(`${label} — توضیح فارسی`, 400),
    descriptionEn: requiredText(`${label} — English description`, 400),
    ctaFa: requiredText(`${label} — دکمه فارسی`, 80),
    ctaEn: requiredText(`${label} — English CTA`, 80),
  });

export const homepageContentSchema = z.object({
  hero: z.object({
    eyebrowFa: requiredText("هیرو — برچسب فارسی", 120),
    eyebrowEn: requiredText("هیرو — English eyebrow", 120),
    titlePrefixFa: optionalText("هیرو — قبل از تاکید فارسی", 200),
    titlePrefixEn: optionalText("هیرو — English title prefix", 200),
    titleAccentFa: requiredText("هیرو — تاکید فارسی", 120),
    titleAccentEn: requiredText("هیرو — English accent", 120),
    titleSuffixFa: optionalText("هیرو — بعد از تاکید فارسی", 200),
    titleSuffixEn: optionalText("هیرو — English title suffix", 200),
    subtitleFa: requiredText("هیرو — زیرعنوان فارسی", 600),
    subtitleEn: requiredText("هیرو — English subtitle", 600),
    ctaPrimaryFa: requiredText("هیرو — دکمه اصلی فارسی", 80),
    ctaPrimaryEn: requiredText("هیرو — English primary CTA", 80),
    ctaSecondaryFa: requiredText("هیرو — دکمه فرعی فارسی", 80),
    ctaSecondaryEn: requiredText("هیرو — English secondary CTA", 80),
  }),
  audiences: z.object({
    titleFa: requiredText("مخاطبان — عنوان فارسی", 120),
    titleEn: requiredText("Audiences — English title", 120),
    subtitleFa: requiredText("مخاطبان — توضیح فارسی", 300),
    subtitleEn: requiredText("Audiences — English subtitle", 300),
    parents: bilingualCard("والدین و دانش‌آموزان"),
    schools: bilingualCard("مدارس"),
    sponsors: bilingualCard("حامیان"),
  }),
  achievements: sectionHeading("افتخارات"),
  mediaMentions: sectionHeading("رسانه"),
  news: sectionHeading("اخبار"),
  videos: sectionHeading("ویدیوها"),
  gallery: sectionHeading("گالری"),
  downloads: sectionHeading("دانلود"),
  related: z.object({
    titleFa: requiredText("سایت‌های مرتبط — عنوان فارسی", 120),
    titleEn: requiredText("Related — English title", 120),
    subtitleFa: requiredText("سایت‌های مرتبط — توضیح فارسی", 400),
    subtitleEn: requiredText("Related — English subtitle", 400),
    pishcup: relatedSite("پیشکاپ"),
    pishtalk: relatedSite("پیشتاک"),
  }),
});

export type HomepageContentCopy = z.infer<typeof homepageContentSchema>;

/** Locale-resolved landing copy (no Fa/En pairs). */
export type HomepageCopy = {
  hero: {
    eyebrow: string;
    titlePrefix: string;
    titleAccent: string;
    titleSuffix: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  audiences: {
    title: string;
    subtitle: string;
    parents: { title: string; description: string; cta: string };
    schools: { title: string; description: string; cta: string };
    sponsors: { title: string; description: string; cta: string };
  };
  achievements: { title: string; subtitle: string; viewAll: string };
  mediaMentions: { title: string; subtitle: string; viewAll: string };
  news: { title: string; subtitle: string; viewAll: string };
  videos: { title: string; subtitle: string; viewAll: string };
  gallery: { title: string; subtitle: string; viewAll: string };
  downloads: { title: string; subtitle: string; viewAll: string };
  related: {
    title: string;
    subtitle: string;
    pishcup: { eyebrow: string; title: string; description: string; cta: string };
    pishtalk: { eyebrow: string; title: string; description: string; cta: string };
  };
};

function pickCard(
  card: {
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
    ctaFa: string;
    ctaEn: string;
  },
  isFa: boolean,
) {
  return {
    title: isFa ? card.titleFa : card.titleEn,
    description: isFa ? card.descriptionFa : card.descriptionEn,
    cta: isFa ? card.ctaFa : card.ctaEn,
  };
}

function pickSection(
  section: {
    titleFa: string;
    titleEn: string;
    subtitleFa: string;
    subtitleEn: string;
    viewAllFa: string;
    viewAllEn: string;
  },
  isFa: boolean,
) {
  return {
    title: isFa ? section.titleFa : section.titleEn,
    subtitle: isFa ? section.subtitleFa : section.subtitleEn,
    viewAll: isFa ? section.viewAllFa : section.viewAllEn,
  };
}

function pickRelatedSite(
  site: {
    eyebrowFa: string;
    eyebrowEn: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
    ctaFa: string;
    ctaEn: string;
  },
  isFa: boolean,
) {
  return {
    eyebrow: isFa ? site.eyebrowFa : site.eyebrowEn,
    title: isFa ? site.titleFa : site.titleEn,
    description: isFa ? site.descriptionFa : site.descriptionEn,
    cta: isFa ? site.ctaFa : site.ctaEn,
  };
}

export function resolveHomepageCopy(copy: HomepageContentCopy, locale: "fa" | "en"): HomepageCopy {
  const isFa = locale === "fa";
  const { hero, audiences, related } = copy;

  return {
    hero: {
      eyebrow: isFa ? hero.eyebrowFa : hero.eyebrowEn,
      titlePrefix: isFa ? hero.titlePrefixFa : hero.titlePrefixEn,
      titleAccent: isFa ? hero.titleAccentFa : hero.titleAccentEn,
      titleSuffix: isFa ? hero.titleSuffixFa : hero.titleSuffixEn,
      subtitle: isFa ? hero.subtitleFa : hero.subtitleEn,
      ctaPrimary: isFa ? hero.ctaPrimaryFa : hero.ctaPrimaryEn,
      ctaSecondary: isFa ? hero.ctaSecondaryFa : hero.ctaSecondaryEn,
    },
    audiences: {
      title: isFa ? audiences.titleFa : audiences.titleEn,
      subtitle: isFa ? audiences.subtitleFa : audiences.subtitleEn,
      parents: pickCard(audiences.parents, isFa),
      schools: pickCard(audiences.schools, isFa),
      sponsors: pickCard(audiences.sponsors, isFa),
    },
    achievements: pickSection(copy.achievements, isFa),
    mediaMentions: pickSection(copy.mediaMentions, isFa),
    news: pickSection(copy.news, isFa),
    videos: pickSection(copy.videos, isFa),
    gallery: pickSection(copy.gallery, isFa),
    downloads: pickSection(copy.downloads, isFa),
    related: {
      title: isFa ? related.titleFa : related.titleEn,
      subtitle: isFa ? related.subtitleFa : related.subtitleEn,
      pishcup: pickRelatedSite(related.pishcup, isFa),
      pishtalk: pickRelatedSite(related.pishtalk, isFa),
    },
  };
}

/**
 * Reads flat `section.field` FormData keys into the nested copy object.
 * Empty missing keys become "" so Zod can report required errors.
 */
export function homepageContentFromFormData(formData: FormData): unknown {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  return {
    hero: {
      eyebrowFa: get("hero.eyebrowFa"),
      eyebrowEn: get("hero.eyebrowEn"),
      titlePrefixFa: get("hero.titlePrefixFa"),
      titlePrefixEn: get("hero.titlePrefixEn"),
      titleAccentFa: get("hero.titleAccentFa"),
      titleAccentEn: get("hero.titleAccentEn"),
      titleSuffixFa: get("hero.titleSuffixFa"),
      titleSuffixEn: get("hero.titleSuffixEn"),
      subtitleFa: get("hero.subtitleFa"),
      subtitleEn: get("hero.subtitleEn"),
      ctaPrimaryFa: get("hero.ctaPrimaryFa"),
      ctaPrimaryEn: get("hero.ctaPrimaryEn"),
      ctaSecondaryFa: get("hero.ctaSecondaryFa"),
      ctaSecondaryEn: get("hero.ctaSecondaryEn"),
    },
    audiences: {
      titleFa: get("audiences.titleFa"),
      titleEn: get("audiences.titleEn"),
      subtitleFa: get("audiences.subtitleFa"),
      subtitleEn: get("audiences.subtitleEn"),
      parents: {
        titleFa: get("audiences.parents.titleFa"),
        titleEn: get("audiences.parents.titleEn"),
        descriptionFa: get("audiences.parents.descriptionFa"),
        descriptionEn: get("audiences.parents.descriptionEn"),
        ctaFa: get("audiences.parents.ctaFa"),
        ctaEn: get("audiences.parents.ctaEn"),
      },
      schools: {
        titleFa: get("audiences.schools.titleFa"),
        titleEn: get("audiences.schools.titleEn"),
        descriptionFa: get("audiences.schools.descriptionFa"),
        descriptionEn: get("audiences.schools.descriptionEn"),
        ctaFa: get("audiences.schools.ctaFa"),
        ctaEn: get("audiences.schools.ctaEn"),
      },
      sponsors: {
        titleFa: get("audiences.sponsors.titleFa"),
        titleEn: get("audiences.sponsors.titleEn"),
        descriptionFa: get("audiences.sponsors.descriptionFa"),
        descriptionEn: get("audiences.sponsors.descriptionEn"),
        ctaFa: get("audiences.sponsors.ctaFa"),
        ctaEn: get("audiences.sponsors.ctaEn"),
      },
    },
    achievements: {
      titleFa: get("achievements.titleFa"),
      titleEn: get("achievements.titleEn"),
      subtitleFa: get("achievements.subtitleFa"),
      subtitleEn: get("achievements.subtitleEn"),
      viewAllFa: get("achievements.viewAllFa"),
      viewAllEn: get("achievements.viewAllEn"),
    },
    mediaMentions: {
      titleFa: get("mediaMentions.titleFa"),
      titleEn: get("mediaMentions.titleEn"),
      subtitleFa: get("mediaMentions.subtitleFa"),
      subtitleEn: get("mediaMentions.subtitleEn"),
      viewAllFa: get("mediaMentions.viewAllFa"),
      viewAllEn: get("mediaMentions.viewAllEn"),
    },
    news: {
      titleFa: get("news.titleFa"),
      titleEn: get("news.titleEn"),
      subtitleFa: get("news.subtitleFa"),
      subtitleEn: get("news.subtitleEn"),
      viewAllFa: get("news.viewAllFa"),
      viewAllEn: get("news.viewAllEn"),
    },
    videos: {
      titleFa: get("videos.titleFa"),
      titleEn: get("videos.titleEn"),
      subtitleFa: get("videos.subtitleFa"),
      subtitleEn: get("videos.subtitleEn"),
      viewAllFa: get("videos.viewAllFa"),
      viewAllEn: get("videos.viewAllEn"),
    },
    gallery: {
      titleFa: get("gallery.titleFa"),
      titleEn: get("gallery.titleEn"),
      subtitleFa: get("gallery.subtitleFa"),
      subtitleEn: get("gallery.subtitleEn"),
      viewAllFa: get("gallery.viewAllFa"),
      viewAllEn: get("gallery.viewAllEn"),
    },
    downloads: {
      titleFa: get("downloads.titleFa"),
      titleEn: get("downloads.titleEn"),
      subtitleFa: get("downloads.subtitleFa"),
      subtitleEn: get("downloads.subtitleEn"),
      viewAllFa: get("downloads.viewAllFa"),
      viewAllEn: get("downloads.viewAllEn"),
    },
    related: {
      titleFa: get("related.titleFa"),
      titleEn: get("related.titleEn"),
      subtitleFa: get("related.subtitleFa"),
      subtitleEn: get("related.subtitleEn"),
      pishcup: {
        eyebrowFa: get("related.pishcup.eyebrowFa"),
        eyebrowEn: get("related.pishcup.eyebrowEn"),
        titleFa: get("related.pishcup.titleFa"),
        titleEn: get("related.pishcup.titleEn"),
        descriptionFa: get("related.pishcup.descriptionFa"),
        descriptionEn: get("related.pishcup.descriptionEn"),
        ctaFa: get("related.pishcup.ctaFa"),
        ctaEn: get("related.pishcup.ctaEn"),
      },
      pishtalk: {
        eyebrowFa: get("related.pishtalk.eyebrowFa"),
        eyebrowEn: get("related.pishtalk.eyebrowEn"),
        titleFa: get("related.pishtalk.titleFa"),
        titleEn: get("related.pishtalk.titleEn"),
        descriptionFa: get("related.pishtalk.descriptionFa"),
        descriptionEn: get("related.pishtalk.descriptionEn"),
        ctaFa: get("related.pishtalk.ctaFa"),
        ctaEn: get("related.pishtalk.ctaEn"),
      },
    },
  };
}
