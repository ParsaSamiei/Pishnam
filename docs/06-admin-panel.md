# Pishnam — Admin Panel Spec

## Decision: custom admin, not Strapi/headless CMS

Reasoning (per your questions): content volume is small (dozens of items), it's a solo project
with a single-repo requirement, and content is added manually rather than by a team of editors.
A separate CMS service adds infrastructure, a second auth system, and upgrade overhead that isn't
justified at this scale. A custom `/admin` section inside the same Next.js app, backed by Prisma,
is faster to build and simpler to run.

If content volume or team size grows significantly later (many editors, complex workflows,
approval chains), revisit Strapi/Payload — the Prisma schema in `04-database-schema.md` is close
enough to a headless-CMS content model that migrating later wouldn't mean starting over.

## Auth

- Single `AdminUser` table (see schema doc), not tied to any public-facing account system (there
  are no public accounts in v1).
- Email + password login, session via NextAuth.js (Credentials provider) or a lightweight custom
  JWT/session-cookie implementation — NextAuth is recommended to avoid hand-rolling session
  security.
- Two roles to start: `owner` (full access) and `editor` (content CRUD, no user/role management).
  Keep it simple — don't over-engineer permissions for a solo/small-team admin.
- `/admin/**` routes gated in the root layout for that segment; redirect unauthenticated requests
  to `/admin/login`.

## What's editable (everything, per your answer)

One admin section per content type from the schema:

- Courses (+ their FA/EN translations, tier, topic tags, related achievements)
- Class sessions (offline schedule — confirmed for v1)
- Achievements
- Team members
- FAQs
- Video entries (Aparat links)
- Download resources — form includes a source toggle (upload a file → local disk storage, or
  paste an
  external link), a category dropdown (datasheets / books / component libraries), and a
  CAD-tool tag field shown only for the component-libraries category. All downloads are public by
  default — no gating option needed.
- Competitions — slug, FA/EN title, optional year, active/order. Parent of leagues.
- Leagues — belongs to a competition; FA/EN title, slug unique per competition, active/order.
- Poster categories — belongs to a league; FA/EN title, slug unique per league, active/order.
  Categories can differ between competitions and between leagues.
- Competition posters — belongs to a poster category; preview image, FA/EN title/description,
  hosted file or external link, active/order. Public page at `/downloads/posters` groups by
  competition → league → category.
- Software & plugins (`SoftwareProduct`) — a picture upload, slug (used as the public page's URL),
  FA/EN title and description, and an active/order toggle. Each product gets its own public page.
- Software files (`SoftwareRelease`) — one row per platform/version under a product: pick the
  product from a dropdown, pick a platform (Windows/macOS/Linux/Web/Android/iOS/Other), a version
  label, and the same upload-or-external-link toggle as download resources, plus per-release notes.
- Datasheet parts (`DatasheetPart`) — cover picture, slug, FA/EN title/excerpt/body, active/order.
  A part can stand alone or list variants. Nested on the same form: PDFs, videos (Aparat or
  hosted), photo gallery, and example code (inline + optional file). Variants are added from the
  parent edit page. Public pages live under `/downloads/datasheets`.
- Blog articles (+ FA/EN translations)
- Job postings
- **Leads** (all form submissions — enroll, sponsor, school, job, general contact) with status
  (new/contacted/closed) so you can track follow-up without a separate CRM.
- **Feedback** (انتقادات و پیشنهادات from the public `/contact-us` page): name optional, message
  required. Listed at `/admin/feedback` with unread/read status; not mixed into Leads because
  there is no phone/email to follow up on.
- **Contact details** (singleton, not a list): phone numbers (any number of them), email, FA/EN
  address, and a Google Maps embed. Edited at `/admin/contact`; shown on the public `/contact`
  page. Paste either the Maps “Embed a map” iframe or the embed URL itself.

## UI pattern

Consistent CRUD pattern reused across every content type to minimize build effort:

- List view: table with search/filter, sort by date/order, active/inactive toggle where relevant.
- Create/edit view: form generated from a per-type field config (label, type, required) — build
  one reusable `AdminForm` component driven by config rather than a bespoke form per type.
- Rich text fields (course body, article body): a simple WYSIWYG (e.g. Tiptap) rather than raw
  HTML/Markdown entry.
- Image fields: upload widget → local disk storage (see frontend/database docs), with preview.
  Every upload — regardless of content type — goes through the full security checklist in
  `05-frontend-architecture.md` ("Upload security"): allowlisted types, verified content, random
  filenames, size limits, no execute permissions on the stored file.
- Bilingual fields: side-by-side FA/EN inputs (or tabs) in the same form, not separate forms per
  locale — reduces the chance of forgetting to fill in one language.

## Leads dashboard

- Landing page of `/admin` shows recent leads across all types, with a prominent unread/new count
  — this is the primary way you'll know a new lead came in, since there's no email notification.
- Each lead: type, submitted fields, timestamp, status dropdown, optional internal note.
- No email notification on new leads — the admin dashboard itself is the notification surface (see
  below). Check the dashboard regularly rather than relying on an inbox alert; revisit if this
  becomes impractical (e.g. an in-app unread badge is cheap to add later without email).

## Explicitly out of scope for v1

- No multi-level approval workflows.
- No public user accounts or self-service anything.
- No analytics dashboards inside admin (use Umami directly — see `09-analytics-i18n.md`).
- No payment/order management (no payments exist).
