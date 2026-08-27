# پیشنام — Pishnam

Marketing site + admin panel for Pishnam Robotics Researchers: bilingual (Persian/English)
Next.js 16 app covering course info, in-person class schedules, achievements, an Aparat video
hub, a download center, a news/blog, and lead-capture forms (enroll, sponsor, school, careers,
contact) -- plus a single custom admin panel backing all of it.

Full product/technical spec lives in [`docs/`](./docs) -- that's the source of truth; keep it in
sync with `prisma/schema.prisma` and this README as things change.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **i18n**: next-intl -- `/` = Persian (default, RTL), `/en/...` = English (LTR)
- **Database**: PostgreSQL via Prisma
- **Auth**: NextAuth.js v5 (Credentials), admin-only -- no public accounts
- **Styling**: Tailwind CSS v4, hand-rolled shadcn-style primitives (Radix UI + CVA)
- **Rich text**: Tiptap (course/article bodies)
- **Analytics**: self-hosted Umami (shared instance, see [Deployment](#deployment))
- **Infra**: Docker Compose (Postgres, Next.js, nginx), GitHub Actions CI/CD

## Getting started (local dev)

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL at minimum

# Local Postgres via Docker (or point DATABASE_URL at your own instance)
docker compose up -d postgres

npx prisma migrate dev    # creates the schema
npm run db:seed           # bootstraps the first admin account
                           # (set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env first)

npm run dev                # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin/login`.

> **Note on this checkout**: `npx prisma generate` needs to reach
> `binaries.prisma.sh` to download its query-engine binary. If you're behind a
> restrictive proxy/firewall and that domain isn't allowlisted, `prisma
generate`/`migrate` will fail with a 403 on that fetch -- allow the domain,
> or set `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` plus a mirrored engine
> URL. On a normal dev machine or in GitHub Actions this just works.

## Scripts

| Command                           | What it does                                  |
| --------------------------------- | --------------------------------------------- |
| `npm run dev`                     | Start the dev server (Turbopack)              |
| `npm run build`                   | Production build                              |
| `npm run lint` / `lint:fix`       | ESLint (Next.js + jsx-a11y)                   |
| `npm run format` / `format:check` | Prettier (with Tailwind class sorting)        |
| `npm run typecheck`               | `tsc --noEmit`                                |
| `npm run test` / `test:watch`     | Vitest (unit + component)                     |
| `npm run test:e2e`                | Playwright — no suite written yet (see below) |
| `npm run prisma:migrate`          | Create + apply a new migration (dev)          |
| `npm run prisma:deploy`           | Apply pending migrations (prod/CI)            |
| `npm run prisma:studio`           | Prisma's DB browser GUI                       |
| `npm run db:seed`                 | Bootstrap the first `AdminUser` (see `.env`)  |

Husky + lint-staged run ESLint/Prettier on staged files automatically at commit time.

## Project structure

See `docs/05-frontend-architecture.md` for the full rationale. Short version:

```
src/
├── app/
│   ├── [locale]/     # public site (fa default, /en for English)
│   ├── admin/         # single-language admin panel, own root layout, auth-gated
│   ├── api/            # route handlers (uploads, etc.)
│   └── uploads/[...path]/  # dev-only static file serving (nginx does this in prod)
├── components/
│   ├── layout/, home/, blog/, admin/, ui/
├── lib/
│   ├── prisma.ts, auth.ts, upload.ts, rate-limit.ts, i18n/, format.ts
├── messages/          # fa.json / en.json -- UI strings only, not content
└── styles/globals.css # design tokens (light/dark), fonts
prisma/schema.prisma
infra/                 # Dockerfile, nginx.conf
docker-compose.yml
```

## Uploads & media

Uploaded files (course covers, achievement photos, download-center resources) are stored on
**local disk**, in a named Docker volume (`uploads`) -- never in the app's writable container
layer, or they'd be lost on every redeploy. Every upload goes through the checklist in
`docs/05-frontend-architecture.md` (`src/lib/upload.ts`): admin-auth-only, allowlisted types,
magic-byte content verification (not filename/Content-Type), image re-encoding via `jimp`,
random filenames, no execute permission on uploaded files, rate-limited, and logged (`UploadLog`).

Stored images come out as JPEG, or PNG when the source has real transparency. `jimp` ships no
WebP codec, which is also why `image/webp` is not an accepted upload type; it replaced `sharp`
because sharp's prebuilt binaries need an x86-64-v2 CPU that the production host doesn't have.
Removing sharp also means Next's Image Optimization is off (`images.unoptimized` in
`next.config.ts`) — it only runs on sharp. Uploads are capped at 2400px on the long edge instead.

In production, nginx serves `/uploads/*` directly from the shared volume (`infra/nginx.conf`).
`src/app/uploads/[...path]/route.ts` is a dev-only fallback so uploads are viewable without
running the full nginx stack locally.

## Deployment

`docker-compose.yml` runs the full stack: Postgres, a one-off `migrator` job (applies pending
Prisma migrations then bootstraps the first admin, both idempotent — `web` waits for it to exit
0), the Next.js app, and nginx.

```bash
cp .env.example .env   # fill in real values
docker compose up -d --build
```

### Production host

The app shares a VPS with two other Docker stacks (pishtalk, iranopen-insitu) behind a single
host nginx that owns `:80`/`:443`. Two constraints follow from that, and both are load-bearing:

- **Nothing in this compose project may bind `:80`.** Our nginx takes `:8081`; the host vhost in
  `infra/nginx-host.conf` proxies to it as `default_server`, which is what makes the app answer on
  the bare server IP. Neither pre-existing vhost declares `default_server`, so both of their
  domains keep matching by name and are unaffected.
- **Images are never pulled on the server.** Only ~1 in 5 TLS handshakes from that host to
  ghcr.io complete, so a registry pull cannot reliably fetch a multi-layer image. CI builds on
  GitHub and streams the result in over SSH. Building _on_ the server is equally out — 3.8 GB of
  RAM with two other apps resident leaves no headroom for `next build`.

Analytics reuses the Umami instance the pishtalk stack already runs (`127.0.0.1:3001`, exposed at
`/analytics` by the host nginx). One Umami instance hosts many websites, so Pishnam is registered
inside it as another website rather than getting a second analytics stack of its own.

### CI/CD (`.github/workflows/`)

- **`ci.yml`** -- every PR and push to `main`: install, `prisma validate`, migrate a throwaway
  test DB, lint, format check, typecheck, unit/component tests, build.

  No E2E step. `@playwright/test` is installed and `npm run test:e2e` exists, but the suite
  itself has not been written -- there is no `playwright.config.ts` and no specs, so the command
  currently fails. The CI job that ran it was removed rather than left permanently red; the
  comment at the bottom of `ci.yml` lists what restoring it takes.

- **`deploy.yml`** -- on push to `main` (or manual dispatch): builds the web image (and the
  `migrator` image, only when its inputs actually changed), `docker save`s them, streams them to
  the server over SSH, retags to `:current`, and rolls the stack at `/opt/pishnam`. Finishes by
  polling `/robots.txt` through the published port and failing the job if the stack never answers.

  Required Actions secrets: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`.
  Optional Actions _variables_: `UMAMI_SCRIPT_URL`, `UMAMI_WEBSITE_ID`.

`/opt/pishnam/.env` is managed by hand on the server and deliberately not synced by CI — it holds
the real secrets. Only `docker-compose.yml` and `infra/nginx.conf` are copied up on each deploy.

### Build-time vs runtime config

`NEXT_PUBLIC_*` values are frozen into the bundle by `next build`, server-side code included
(`next/dist/docs/01-app/02-guides/environment-variables.md`). They are passed as Docker build args
by the deploy workflow, **not** read from the server's `.env`. Practical consequence: pointing the
site at a real domain instead of the bare IP means editing `SITE_URL` in `deploy.yml` and
redeploying — an `.env` change alone will silently do nothing.

### Rolling back

Every deploy leaves its image tagged with the commit SHA, so rolling back is a retag:

```bash
cd /opt/pishnam
docker image ls pishnam-web                       # pick a previous SHA
docker tag pishnam-web:<sha> pishnam-web:current
docker compose up -d web
```

Note this rolls back code only. If the bad deploy applied a migration, reverse that separately —
`prisma migrate deploy` has no down-migrations.

## Content model & translations

Simple models (`Achievement`, `TeamMember`, `Faq`, `VideoEntry`, `DownloadResource`,
`JobPosting`) use parallel `xFa` / `xEn` fields. Rich-text-heavy models (`Course`, `Article`) use
a separate `*Translation` table instead, so adding a locale later doesn't mean a schema migration
on the parent table. `src/lib/i18n/pick.ts` (`pickLocaleField`) picks between parallel fields by
the active locale; translation-table models are queried with a `where: { locale }` filter
directly (see `src/components/home/news-teaser-section.tsx` for the pattern).

`src/messages/{fa,en}.json` hold **UI strings only** (nav labels, buttons, errors) -- content
(course bodies, article text, achievement titles, etc.) always lives in the database, never in
the message files, so it stays admin-editable.
