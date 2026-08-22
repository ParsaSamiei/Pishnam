# Pishnam — Frontend Architecture

## Framework: Next.js 16, App Router — CONFIRMED

Covers both the marketing/content site and the admin panel in one app/repo (matches the
single-repo requirement), and builds on your existing Next.js experience, which matters most for
a solo project. SSR/SSG/ISR all available in one framework, strong SEO defaults out of the box.

## Rendering strategy per page type

| Page type                               | Strategy                                     | Why                                                                |
| --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Homepage, about, static marketing pages | SSG (static, rebuilt on deploy)              | Rarely changes, fastest possible load                              |
| Course catalog & course detail          | ISR (revalidate every few hours)             | Content updated via admin occasionally, doesn't need to be instant |
| Blog/news listing & article detail      | ISR (revalidate every ~10–30 min)            | Published more frequently                                          |
| Achievements, videos, downloads         | ISR                                          | Same reasoning as courses                                          |
| Admin panel                             | SSR / dynamic, fully server-authenticated    | Always needs fresh data, behind auth                               |
| Forms (enroll, sponsor inquiry, etc.)   | Client component + server action / API route | Interactive, needs client-side validation feedback                 |

## Responsiveness

No native mobile app planned, but "fully responsive" is a hard requirement — treat every page as
mobile-first: build and test the ~360–414px layout before the desktop layout, then expand.
Because there's no separate mobile app, keep business logic reachable via clean server
actions/API routes now — if a mobile app is ever wanted later, those routes become the API surface
without a rebuild.

## Folder structure

```
pishnam/
├── src/
│   ├── app/
│   │   ├── [locale]/                     # fa | en via next-intl routing
│   │   │   ├── page.tsx                  # home
│   │   │   ├── about/
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx              # catalog + filters
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── classes/page.tsx          # offline class schedule (pending confirm)
│   │   │   ├── videos/page.tsx
│   │   │   ├── downloads/[category]/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── sponsors/page.tsx
│   │   │   ├── schools/page.tsx
│   │   │   ├── careers/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── enroll/page.tsx
│   │   ├── admin/                        # not locale-prefixed, single-language (fa) admin UI
│   │   │   ├── layout.tsx                # auth-gated shell
│   │   │   ├── page.tsx                  # dashboard (recent leads, etc.)
│   │   │   ├── courses/
│   │   │   ├── achievements/
│   │   │   ├── articles/
│   │   │   ├── leads/
│   │   │   └── ...one folder per content type
│   │   ├── api/
│   │   │   ├── leads/route.ts            # form submissions
│   │   │   └── admin/...                 # admin CRUD endpoints (or use server actions instead)
│   │   └── layout.tsx                    # root layout
│   ├── components/
│   │   ├── layout/ (SiteHeader, SiteFooter, LanguageSwitch)
│   │   ├── home/ (AudienceEntryCard, AchievementsHighlight, ...)
│   │   ├── course/
│   │   ├── blog/
│   │   ├── forms/ (LeadCaptureForm, FeedbackForm + variants)
│   │   ├── admin/ (DataTable, AdminForm, ...)
│   │   └── ui/ (shadcn components)
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts                       # admin auth (NextAuth or custom, see admin doc)
│   │   ├── validation/ (zod schemas, shared client+server)
│   │   └── i18n/ (next-intl config, message files)
│   ├── messages/
│   │   ├── fa.json
│   │   └── en.json
│   └── styles/globals.css
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── infra/ (Dockerfiles, nginx config)
├── docker-compose.yml
├── .github/workflows/ (CI/CD)
└── ...config files
```

## Data fetching

- Server Components fetch directly via Prisma for public pages (no need for a separate internal
  API layer for the frontend itself — keeps this simple for a solo dev).
- Forms submit to Next.js **Server Actions** (preferred over hand-rolled API routes where
  possible) which write to the `Lead` table — no email notification pipeline; new leads surface
  directly in the admin dashboard (see admin doc).
- Admin panel also uses Server Actions/Server Components directly against Prisma, protected by
  session checks in layout.

## Upload security (enforced on every upload, no exceptions)

Local storage doesn't come with the built-in protections a managed object store gives you (signed
URLs, automatic content-type isolation, no execute permissions by default), so these checks are
mandatory server-side on **every** file upload — course covers, achievement photos, download-center
files, everything that goes through the admin panel:

1. **Auth + authorization first** — upload endpoints only reachable by an authenticated
   `AdminUser` session; no public upload endpoint exists anywhere on the site.
2. **File type allowlist, not blocklist** — accept only explicitly listed extensions/MIME types
   per field (e.g. images: `.jpg .jpeg .png .webp`; downloads: a short allowlist per category, no
   open-ended "any file type").
3. **Verify actual file content, not just the extension** — check the file's real MIME type via
   magic-byte/signature inspection (e.g. `file-type` package), not the client-supplied
   `Content-Type` header or filename extension, which are trivially spoofable.
4. **Re-encode/strip images on upload** — run uploaded images through a processing step (e.g.
   `sharp`) that re-encodes them; this both normalizes format/size and strips embedded scripts/
   metadata that could hide in a crafted image file.
5. **Enforce a max file size per field** — reject oversized uploads before they hit disk (both at
   the reverse-proxy level and in the app), sized appropriately per content type (photos vs. part
   library archives).
6. **Never trust the client-supplied filename** — generate a new random filename/UUID for the
   stored file; never write the user's original filename to disk (blocks path traversal via
   `../../` sequences and null-byte tricks, and avoids collisions).
7. **Store uploads outside any web-executable path**, and serve them with **no execute
   permission** on the volume — the uploads directory should never be a place the server (or
   nginx) will interpret as a script; served purely as static files with a fixed, safe
   `Content-Type` set by the server (not inferred from the stored file).
8. **Rate-limit upload endpoints** to prevent disk-filling abuse, even from an authenticated
   session.
9. **Scan for malware** if/when feasible — even a lightweight ClamAV pass in the upload pipeline
   is worth adding once traffic/content volume justifies the operational cost; flag as a fast
   follow if not in the initial build.
10. **Log every upload** (who, when, filename→stored-name mapping, size) for audit purposes.

This checklist applies uniformly regardless of whether the resource ends up public (download
center files) or admin-only (draft images) — public-facing files are actually the higher-risk
case, since they're the ones an attacker can point other users at directly.

## Media storage: local disk (for now)

Uploaded images/files (achievement photos, course covers, download-center files) are stored on
**local disk**, not S3/object storage, for this version.

- Stored under a dedicated path, e.g. `/app/uploads`, **mounted as a persistent Docker volume**
  in `docker-compose.yml` — critical: if this isn't a named volume, uploaded files are lost on
  every container rebuild/redeploy.
- Served either directly by Next.js (a route handler streaming from `/app/uploads`) or via the
  reverse proxy (nginx) pointing at the volume — nginx serving static files directly is more
  efficient and recommended.
- Back up this volume on the same schedule as the Postgres backup — a database backup without the
  matching media files is incomplete.
- **Future consideration**: move to S3-compatible object storage (Cloudflare R2 or MinIO) if the
  app ever needs to run multiple server instances, disk usage becomes a problem, or you want
  offloaded backups/CDN delivery. Since paths are stored as plain strings in the database, this
  migration is low-effort later — swap the storage backend and update stored paths/URLs, no schema
  change needed.

```yaml
# docker-compose.yml excerpt
services:
  web:
    volumes:
      - uploads:/app/uploads
  nginx:
    volumes:
      - uploads:/app/uploads:ro

volumes:
  uploads:
```

## Performance targets

- Lighthouse Performance ≥ 90 on mobile for marketing pages.
- Images: `next/image` everywhere, served from object storage with responsive sizes.
- Fonts: self-hosted Vazirmatn (variable font) via `next/font/local`, avoid layout shift.
- Aparat video embeds lazy-loaded (don't load iframe until in viewport / user interaction) —
  current WP site likely loads these eagerly, a real perf win to fix here.
