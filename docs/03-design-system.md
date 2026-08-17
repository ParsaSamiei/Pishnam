# Pishnam — Design System

## Color palette — confirmed from logo

```
--pishnam-gold-500:    #E6A817   (primary CTA, highlights, badges — was placeholder, now confirmed)
--pishnam-navy-900:    #18222D   (headers, primary text on light bg, footer bg — dark navy/charcoal from logo)
--pishnam-steel-600:   #3B5E82   (secondary surfaces, nav hover, secondary accents — slate/steel blue from logo)
--pishnam-off-white:   #F2F2F0   (page background, light surfaces)
--pishnam-red-600:     #E5001A   (alerts, competition/urgency accents, form errors — use sparingly)
```

These five are the actual logo-derived brand colors and replace the earlier placeholder hex
values. Everything else in this palette (neutrals, semantic states) is filled in around them.

## Foundational decisions

- **Light and dark mode, both supported.** Default follows the device/browser preference
  (`prefers-color-scheme`); if that preference is unset/unavailable, default to **dark mode**.
  Persist the user's explicit choice (if they override via a toggle) in `localStorage` so it
  sticks across visits regardless of system setting.
- **Fully responsive** — mobile-first breakpoints; this needs to work well down to ~360px width.
- **RTL-first**: Persian is primary, so build all layout with logical CSS properties
  (`ms-*`/`me-*`, `start`/`end`) instead of hardcoded `left`/`right`, so English (`ltr`) pages
  mirror correctly rather than needing a separate set of styles.

## Color palette — light & dark variants

Brand anchors stay identical in both modes (the gold and steel-blue accents don't shift); what
changes between modes is which colors serve as background/surface vs. text, and the neutral scale.

```css
/* Shared brand anchors — same in both modes */
--pishnam-gold-500: #e6a817; /* primary CTA, highlights, badges */
--pishnam-gold-600: #c9910e; /* CTA hover/active */
--pishnam-steel-600: #3b5e82; /* links, secondary accents, info states */
--pishnam-danger: #e5001a; /* form errors, alerts */
--pishnam-success: #16a34a; /* confirmations */

/* Light mode (default when device prefers light) */
:root,
[data-theme="light"] {
  --bg-page: #f2f2f0; /* confirmed off-white */
  --bg-surface: #ffffff;
  --bg-surface-alt: #e8e8e5;
  --border: #dadad6;
  --text-primary: #18222d; /* confirmed navy, doubles as ink on light bg */
  --text-secondary: #4a5560;
  --steel-accent: #3b5e82; /* steel blue reads fine on light bg as-is */
}

/* Dark mode (default when device prefers dark, and the overall fallback default) */
[data-theme="dark"] {
  --bg-page: #18222d; /* confirmed navy becomes the base background */
  --bg-surface: #1f2a36; /* slightly lifted surface for cards/header */
  --bg-surface-alt: #263241;
  --border: #34424f;
  --text-primary: #f2f2f0; /* confirmed off-white becomes primary text */
  --text-secondary: #a9b4be;
  --steel-accent: #6e8aa6; /* lightened steel so it stays legible on dark bg */
}
```

### Default resolution logic

1. Check `window.matchMedia('(prefers-color-scheme: dark)')`.
2. If it resolves (`true` or `false`), use that as the initial theme.
3. If the media query is unsupported/indeterminate, **default to dark mode**.
4. If the user manually toggles, store the explicit choice (`localStorage: pishnam-theme`) and
   respect it on future visits over the system preference, until they clear it.
5. Apply as `data-theme="light" | "dark"` on `<html>`, resolved **before first paint** (inline
   script in `<head>` or a Next.js theme script) to avoid a flash of the wrong theme.

## Typography

- **Persian**: Vazirmatn (variable font) — clean, modern, good number glyph support.
- **English**: Inter or the same Vazirmatn (it has reasonable Latin coverage) — prefer a matching
  pair so FA/EN pages feel consistent; recommend testing Vazirmatn + Inter side by side before
  locking.
- Scale (Tailwind default scale is fine): use `text-sm` body copy sparingly on Persian text —
  Persian tends to need slightly larger base size (16–18px) for comfortable reading vs. Latin.

## Component stack

- **Tailwind CSS** as the styling foundation.
- **shadcn/ui** for accessible primitives (dialog, dropdown/menu, form controls, tabs, toast) —
  customize theme tokens to match the palette above rather than using shadcn defaults.
- Additional as needed:
  - `embla-carousel-react` — course/achievements/testimonial carousels.
  - `react-hook-form` + `zod` — all lead-capture forms (enroll, sponsor inquiry, etc.), shared
    validation schemas between client and server.
  - `lucide-react` — icon set (matches shadcn conventions).

## Key components to build (beyond shadcn primitives)

- `SiteHeader` — logo, primary nav (2-level max), CTA button, language switch, search trigger.
- `AudienceEntryCard` — the 3 homepage audience-entry blocks (parents/students, schools, sponsors).
- `CourseCard` / `CourseFilterBar` (filter by tier/age/topic).
- `AchievementCard` + `AchievementsGrid` (filterable by year/competition).
- `ArticleCard` (blog/news listing).
- `VideoEmbedCard` (Aparat embed wrapper, lazy-loaded).
- `DownloadResourceRow`.
- `LeadCaptureForm` (shared base for enroll / class-seat / sponsor / school / job forms — same
  visual treatment, different field sets).
- `LanguageSwitch` (FA/EN toggle, preserves current page).
- `ThemeToggle` (light/dark switch, reflects and updates the resolution logic above; sits near
  the language switch in the header).
- `SiteFooter`.

## Visual style direction

Bolder and more structured than a generic SaaS template — this is a youth-facing educational
brand, so:

- Confident, high-contrast navy sections alternating with light neutral sections (mirrors the
  current site's colored-band sectioning, e.g. yellow/green wave dividers) but cleaner and less
  cluttered — fewer, more purposeful color blocks rather than a different bright color on every
  tile.
- Photography-forward for achievements/competitions (real student/team photos carry credibility).
- Iconography for course topics/tiers should be simple, consistent-stroke-width, not mixed
  illustration styles.

## Accessibility baseline

- WCAG AA contrast minimum for text — verify independently in both light and dark mode, since
  swapping backgrounds can shift a previously-fine pairing below threshold (check
  `--text-secondary` on `--bg-surface-alt` in dark mode especially).
- All interactive elements keyboard-navigable (shadcn primitives handle most of this).
- Form errors announced via `aria-live`, not color alone.
- Respect `prefers-reduced-motion` for the theme-switch transition (no jarring cross-fade for
  users who've asked for reduced motion).
