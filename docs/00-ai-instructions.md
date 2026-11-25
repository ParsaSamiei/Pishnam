# Pishnam — AI / Coding-Agent Instructions

Purpose: this file is the entry point for any AI coding assistant (Claude Code, Cursor, etc.)
working on this repo. Read this first, then the other docs in this folder as needed for the task
at hand.

## Project in one paragraph

Pishnam (پژوهشگران رباتیک پیشنام) is a robotics club in Tehran rebuilding its WordPress site as
a custom-coded, bilingual (Persian primary / English secondary) Next.js site. It teaches robotics
from first-grade electronics basics up to competitive RoboCup-style robots (Rescue Line, Rescue
Maze). Audiences: parents, students, prospective sponsors, and schools. No e-commerce or payments
in v1. No user progress-tracking in v1. Solo developer, single repo, GitHub Actions CI.

## Doc index

| File                             | Covers                                                |
| -------------------------------- | ----------------------------------------------------- |
| `01-product-brand.md`            | mission, audiences, tone, brand assets                |
| `02-information-architecture.md` | sitemap, page inventory, content types                |
| `03-design-system.md`            | colors, type, components, Tailwind/shadcn conventions |
| `04-database-schema.md`          | Prisma schema, content models                         |
| `05-frontend-architecture.md`    | Next.js structure, rendering strategy, folder layout  |
| `06-admin-panel.md`              | custom admin spec, auth, CRUD surfaces                |
| `07-seo-guidelines.md`           | metadata, sitemap, structured data, i18n SEO          |
| `08-development-guidelines.md`   | code style, testing, CI/CD, git conventions           |
| `09-analytics-i18n.md`           | Umami setup, event plan, FA/EN i18n approach          |

## Non-negotiable constraints (do not violate without explicit human sign-off)

0. **Framework is Next.js 16 (App Router) — confirmed, not open for reconsideration.**
1. **No payment/e-commerce logic** — enrollment and class-seat requests, including offline class
   ("کلاس‌های حضوری") seat requests, are lead-capture forms only, not checkout flows.
2. **No user progress-tracking / LMS features** — explicitly out of scope for v1.
3. **Single repo** — do not split into a separate CMS or microservice repo. Admin lives inside the
   same Next.js app.
4. **Bilingual from day one** — every user-facing page needs a Persian and English route; don't
   ship Persian-only pages assuming English "later."
5. **Light and dark mode required.** Default follows device preference
   (`prefers-color-scheme`); if unset, default to dark. Resolve theme before first paint (no
   flash of wrong theme). See `03-design-system.md` for token structure.
6. **Brand colors**: gold `#E6A817`, dark navy `#18222D`, slate/steel blue `#3B5E82`, off-white
   `#F2F2F0`, red `#E5001A` — confirmed from the logo, see `03-design-system.md` for full tokens.
7. **Media storage is local disk for now, not S3/object storage** — see `05-frontend-architecture.md`
   for the persistent-volume setup. Don't wire up an S3/R2 SDK unless this is explicitly revisited.
8. **Every file upload must pass the full security checklist in `05-frontend-architecture.md`**
   ("Upload security") — no upload path (admin panel, any future feature) skips auth checks, type
   allowlisting, content verification, re-encoding, filename randomization, or execute-permission
   isolation. This is not optional hardening to add later; build it in from the first upload
   endpoint.
9. Logo and brand name ("Pishnam" / پیشنام) stay as-is; a final logo file will be provided later —
   use a placeholder mark until then, don't invent a new logo.

## How to work

- Before generating code for a page or feature, check `02-information-architecture.md` for where
  it belongs and `04-database-schema.md` for whether it needs a content model.
- Before styling anything, check `03-design-system.md` — don't introduce ad hoc colors, spacing,
  or components outside the system without flagging it.
- Any new content type (something an admin should be able to CRUD) must be added to both
  `04-database-schema.md` and `06-admin-panel.md` — don't hardcode content that should be
  editable.
- Follow `08-development-guidelines.md` for commit style, branch naming, and required checks
  before opening a PR.
- When uncertain about a product decision (not a technical one), stop and ask rather than
  assuming — this is a solo-founder project and silent scope creep is costly.

## Definition of done for any feature

- Works in both `fa` and `en` locales.
- Responsive from ~360px to desktop.
- No console errors/warnings.
- Passes lint + typecheck (see `08-development-guidelines.md`).
- If it involves content: editable from the admin panel, not hardcoded.
- If it's a new page: has metadata per `07-seo-guidelines.md`.
