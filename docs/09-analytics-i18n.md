# Pishnam — Analytics & i18n

## Analytics: Umami

You've used Umami before, so reuse that expertise here.

- Self-hosted (add a `umami` service + its own Postgres — or share the main Postgres instance with
  a separate schema — to `docker-compose.yml`) or Umami Cloud — either works; self-hosted keeps
  everything in your existing infra story, Umami Cloud is less ops overhead. Your call based on
  how much you want to manage.
- Privacy-friendly, cookie-consent-free by design — good fit since there's no stated compliance
  requirement to build around, but this avoids the question entirely.

### Event plan (beyond default pageviews)

Track the moments that map to your actual goals (leads), not vanity events:

| Event                    | Fires when                                                                  |
| ------------------------ | --------------------------------------------------------------------------- |
| `enroll_form_submit`     | Enrollment form successfully submitted (include course/tier in event data)  |
| `class_seat_request`     | Offline class seat request submitted (if that section ships)                |
| `sponsor_inquiry_submit` | Sponsor inquiry form submitted                                              |
| `school_inquiry_submit`  | School/partnership inquiry form submitted                                   |
| `job_application_submit` | Job application submitted                                                   |
| `contact_form_submit`    | General contact form submitted                                              |
| `feedback_form_submit`   | Criticisms & suggestions form submitted on `/contact-us`                    |
| `video_play`             | Aparat embed played (topic/tier in event data) — signals content engagement |
| `download_click`         | Download resource clicked (category + title in event data)                  |
| `language_switch`        | User toggles FA/EN — useful to see real bilingual usage vs. assumption      |

- Track by locale (`fa`/`en`) as a property on relevant events so you can see whether the English
  content is actually reaching/converting an audience, since it's a hypothesis worth validating.

## i18n: Persian (primary) + English (full parity)

Per your answer — "persian and english everything" — this is **full bilingual parity**, not an
English landing page. Every route needs both locales.

### Approach

- **`next-intl`** for routing + message management (works cleanly with App Router, handles
  locale-prefixed routing, `hreflang`, and RTL/LTR switching).
- Route structure: `/` = Persian (no prefix, since it's primary), `/en/...` = English — matches
  the SEO doc's URL structure.
- **Static/UI strings** (nav labels, buttons, form labels, error messages): stored in
  `messages/fa.json` / `messages/en.json`, loaded via `next-intl`.
- **Content-model strings** (course descriptions, article bodies, achievement titles, etc.): stored
  as translation rows/fields directly in the database (see `04-database-schema.md` —
  `CourseTranslation`, `ArticleTranslation`, or parallel `*Fa`/`*En` fields for simpler models),
  editable per-locale in the admin panel. Don't route this content through the static message
  files — it needs to be editable without a code deploy.

### RTL/LTR handling

- `dir="rtl"` on `<html>` for `fa`, `dir="ltr"` for `en` — set in the root layout based on active
  locale.
- Use Tailwind's logical properties (or the RTL plugin) so spacing/positioning utilities flip
  automatically rather than needing two separate stylesheets — flagged already in the design
  system doc, repeated here because it's the thing most likely to be gotten wrong if skipped
  early.
- Icons that imply direction (arrows, chevrons) need explicit mirroring per locale — audit these
  specifically during QA, they're an easy miss.

### Content parity workflow (admin)

- When creating/editing Course, Article, Achievement, etc. in the admin, show FA and EN fields
  together (tabs or side-by-side) so nothing ships half-translated by accident.
- Optional nice-to-have, not required for v1: a "missing translation" indicator in the admin list
  view (flag items where the EN fields are empty) so gaps are visible at a glance rather than
  discovered by a site visitor.

## No additional compliance requirements identified

Per your answer, nothing specific comes to mind right now. Revisit if hosting location, target
markets, or data collected (e.g. if accounts/payments are added later) change — at that point,
data residency and privacy-policy requirements would need a fresh look.
