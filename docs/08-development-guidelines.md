# Pishnam — Development Guidelines

Context: solo developer, single repo, GitHub Actions for CI/CD.

## Repo structure

Single repository containing the Next.js app (public site + admin panel), Prisma schema, and
Docker/infra config — per your single-repo requirement. No separate CMS repo.

## Language & tooling

- TypeScript in **strict mode** (`"strict": true` in `tsconfig.json`) — worth the upfront friction
  solo, since it catches mistakes that would otherwise surface as production bugs with no one else
  to catch them in review.
- ESLint (Next.js recommended config + a11y plugin) + Prettier, run on every commit via a
  pre-commit hook (`husky` + `lint-staged`) so issues are caught before they even reach CI.
- Path aliases (`@/components`, `@/lib`, etc.) configured in `tsconfig.json` for clean imports.

## Testing (right-sized for a solo project — not enterprise-heavy)

- **Unit tests** (Vitest): validation schemas (zod), utility functions (date formatting,
  slug generation), and any non-trivial business logic (e.g. lead-status transitions).
- **Component tests** (React Testing Library): key shared components (`LeadCaptureForm`,
  `AdminForm`) where bugs would be costly.
- **E2E smoke tests** (Playwright): the handful of flows that must never break — homepage loads in
  both locales, a course page renders, the enroll form submits successfully, admin login works.
  Don't aim for exhaustive E2E coverage; a small, high-value smoke suite is enough for one
  developer to maintain.
- Skip: heavy visual regression tooling, contract testing, etc. — not justified at this scale.

## Git conventions

- **Branching**: trunk-based with short-lived feature branches (`feature/course-catalog`,
  `fix/enroll-form-validation`). Merge to `main` via PR even solo — keeps a clean history and
  forces the CI gate to run before anything ships.
- **Commits**: Conventional Commits style (`feat:`, `fix:`, `chore:`, `docs:`) — enables automatic
  changelog generation later if useful, and just keeps history scannable.
- **PRs**: even as a solo dev, use PRs as a checkpoint — CI must pass (lint, typecheck, unit tests,
  build) before merge.

## CI/CD (GitHub Actions)

```
.github/workflows/
├── ci.yml       # on PR + push to main: install, lint, typecheck, unit+component tests, build
└── deploy.yml   # after ci.yml passes on main: build app/migrator/seeder images, push to GHCR,
                 # SSH to /opt/pishnam and `docker compose pull && up -d`
```

- `ci.yml` should run Prisma migration checks (`prisma migrate diff` / `validate`) so schema drift
  is caught before deploy.
- `deploy.yml` builds three production images (app, migrator, seeder), pushes them to GHCR, then
  SSHes into the VPS to pull and restart the stack — same shape as PishTalk's deploy.
- GitHub Actions secrets for SSH: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`. App secrets live in
  the server's `/opt/pishnam/.env`, not in the workflow.

## Environment management

- `.env.example` committed with every required variable documented (no real values).
- Three environments minimum: local (Docker Compose), staging (optional but recommended before
  production, even solo — catches issues with real-ish data), production.

## Documentation habits

- Keep this `docs/` folder as the source of truth; update it alongside code changes rather than
  letting it drift — especially `04-database-schema.md` whenever `schema.prisma` changes.
- Inline comments reserved for _why_, not _what_ — code should be self-explanative for the _what_.

## Definition of done (mirrors `00-ai-instructions.md`)

A feature isn't done until: both locales work, responsive, no console errors, lint/typecheck/tests
pass, content is admin-editable (not hardcoded) where applicable, and metadata is set per
`07-seo-guidelines.md`. **If the feature touches file uploads**, it isn't done until it passes
every item in the upload security checklist in `05-frontend-architecture.md` — this gets
re-verified on every PR that touches an upload path, not just the first time it's built.
