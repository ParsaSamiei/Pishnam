# Pishnam — SEO Guidelines

## Scope
Bilingual SEO (Persian primary, English secondary) — no local-SEO/Google Business work planned
right now (per your answer), and no prior WordPress rankings need to be explicitly preserved (per
your answer) — but redirect old WP URLs to new equivalents anyway wherever a clear 1:1 mapping
exists, as a low-cost safety net against dead links from existing external backlinks/social posts.

## URL structure
- `pishnam.com/` → Persian (default, no `/fa` prefix — since Persian is primary)
- `pishnam.com/en/...` → English
- Locale-neutral, human-readable slugs for content: `/courses/rescue-line`, `/blog/what-is-mechatronics`
- Keep slugs stable once published — changing them loses any accumulated ranking.

## Metadata (per page)
Use Next.js Metadata API (`generateMetadata`) for every route:
- `title` — page-specific, template: `%s | پیشنام` (fa) / `%s | Pishnam` (en)
- `description` — unique per page, 120–160 chars, written for the target audience of that page
  (e.g. course pages describe what students build, not generic boilerplate)
- `alternates.languages` — `hreflang` tags linking each page to its `fa`/`en` counterpart, plus
  `x-default` pointing to the Persian version
- Open Graph + Twitter card tags — especially important for achievement/competition posts and
  blog articles, which are likely to be shared on social (mirrors current Instagram/Threads/
  Telegram presence)

## Structured data (JSON-LD)
- `Organization` schema on homepage (name, logo, sameAs → social profiles, contact).
- `Course` schema on course detail pages (name, description, provider).
- `Article`/`BlogPosting` schema on blog posts (headline, datePublished, image, author).
- `FAQPage` schema on the FAQ page if using accordion-style Q&A.
- `Event`-style info is not needed unless competitions get individual event pages later.

## Sitemap & robots
- Auto-generated `sitemap.xml` (Next.js `app/sitemap.ts`) covering both locales, regenerated on
  build/ISR revalidation.
- `robots.txt` allowing full crawl of public routes, disallowing `/admin/**` and any API routes.
- Submit sitemap via Google Search Console (per your answer, SEO work itself will be done through
  Google's own tools — this just ensures the technical foundation is correct for that to work).

## Content guidelines for SEO
- Course and blog content should target real search intent in Persian (e.g. "آموزش رباتیک برای
  کودکان", "کلاس رباتیک تهران") — align page titles/H1s with how parents/students actually search,
  not just internal terminology.
- English pages are not literal translations for SEO's sake — write them for an English-searching
  audience (international competitions, sponsors, diaspora parents), which may mean different
  emphasis than the Persian version even when covering the same page.
- One `<h1>` per page, logical heading hierarchy, descriptive image `alt` text (especially
  important for achievement photos — "Pishnam team RoboCup Bangkok 2022 Rescue Line 1st place" ,
  not "IMG_2312").

## Performance as SEO
Core Web Vitals count toward ranking — this reinforces the performance targets already set in
`05-frontend-architecture.md` (Lighthouse ≥ 90 mobile, lazy-loaded video embeds, optimized images).
