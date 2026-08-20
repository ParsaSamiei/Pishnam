import type { Metadata } from "next";

/**
 * Builds correct per-page hreflang alternates, per docs/07-seo-guidelines.md
 * ("alternates.languages -- hreflang tags linking each page to its fa/en
 * counterpart, plus x-default pointing to the Persian version").
 *
 * `path` is the locale-neutral route path (no /en prefix), e.g. "" for the
 * homepage, "/courses/rescue-line" for a course. Every page's
 * generateMetadata must call this with ITS OWN path -- a single hardcoded
 * value in the root layout would make every page claim its English/Persian
 * counterpart is the homepage, which is wrong for every page but the
 * homepage itself.
 */
export function buildAlternates(path: string = ""): Metadata["alternates"] {
  const normalized = path === "/" ? "" : path;
  return {
    languages: {
      fa: normalized || "/",
      en: `/en${normalized}`,
      "x-default": normalized || "/",
    },
  };
}
