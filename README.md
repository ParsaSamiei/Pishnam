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
- **Analytics**: self-hosted Umami
- **Infra**: Docker Compose (Postgres, Next.js, nginx, Umami), GitHub Actions CI/CD

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

| Command                           | What it does                                 |
| --------------------------------- | -------------------------------------------- |
| `npm run dev`                     | Start the dev server (Turbopack)             |
| `npm run build`                   | Production build                             |
| `npm run lint` / `lint:fix`       | ESLint (Next.js + jsx-a11y)                  |
| `npm run format` / `format:check` | Prettier (with Tailwind class sorting)       |
| `npm run typecheck`               | `tsc --noEmit`                               |
| `npm run test` / `test:watch`     | Vitest (unit + component)                    |
| `npm run test:e2e`                | Playwright smoke suite                       |
| `npm run prisma:migrate`          | Create + apply a new migration (dev)         |
| `npm run prisma:deploy`           | Apply pending migrations (prod/CI)           |
| `npm run prisma:studio`           | Prisma's DB browser GUI                      |
| `npm run db:seed`                 | Bootstrap the first `AdminUser` (see `.env`) |

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
magic-byte content verification (not filename/Content-Type), image re-encoding via `sharp`,
random filenames, no execute permission on the volume, rate-limited, and logged (`UploadLog`).

In production, nginx serves `/uploads/*` directly from the shared volume (`infra/nginx.conf`).
`src/app/uploads/[...path]/route.ts` is a dev-only fallback so uploads are viewable without
running the full nginx stack locally.

## Deployment

`docker-compose.yml` runs the full stack: Postgres, one-off `migrator` and `seeder` jobs (apply
pending Prisma migrations and optionally bootstrap the first admin, then exit — `web` waits for
both), the Next.js app, nginx, and self-hosted Umami (with its own separate Postgres instance).

```bash
cp .env.example .env   # fill in real values
docker compose up -d --build
```

CI/CD (`.github/workflows/`):

- **`ci.yml`** -- every PR and push to `main`: install, `prisma validate`, migrate a throwaway
  test DB, lint, format check, typecheck, unit/component tests, build, then a Playwright smoke
  suite against a real build.
- **`deploy.yml`** -- after `ci.yml` succeeds on `main`: builds the production, migrator, and
  seeder images, pushes them to GHCR, then SSHes into the VPS to pull the new images and roll the
  stack (`docker compose pull` + `up -d` at `/opt/pishnam`). Requires these GitHub Actions
  secrets: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` (same as PishTalk).

Swap the SSH-deploy step in `deploy.yml` for something else (e.g. a managed container host) if
the target platform ever changes -- nothing else depends on it.

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
