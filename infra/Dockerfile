# syntax=docker/dockerfile:1

# --- deps: install dependencies only (cached separately from source) ------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: generate Prisma client + build the Next.js app --------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Dummy values so `next build` can statically evaluate pages that don't
# actually hit the DB at build time; real values come from the environment
# at runtime via docker-compose/.env.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV AUTH_SECRET="build-time-placeholder"
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* is frozen into the bundle by `next build` -- it is NOT read
# from the environment at runtime, on the server side either (see
# node_modules/next/dist/docs/01-app/02-guides/environment-variables.md,
# "Bundling Environment Variables for the Browser"). Without this arg,
# robots.ts / sitemap.ts / metadataBase all fall back to their
# `?? "http://localhost:3000"` default and ship localhost URLs to production.
#
# Consequence to remember: changing the public site URL (e.g. when the real
# domain replaces the bare IP) requires a REBUILD, not just an .env edit.
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
# Same build-time-freezing applies to the analytics vars. Both are optional --
# components/analytics-script.tsx renders nothing unless both are set.
ARG NEXT_PUBLIC_UMAMI_SCRIPT_URL=""
ENV NEXT_PUBLIC_UMAMI_SCRIPT_URL=${NEXT_PUBLIC_UMAMI_SCRIPT_URL}
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID=""
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=${NEXT_PUBLIC_UMAMI_WEBSITE_ID}

RUN npm run build

# --- migrator: one-off job -- applies migrations, then bootstraps the admin -
#
# Built FROM deps, NOT FROM builder. `FROM builder` drags in the full source
# tree and .next output, which made the old migrator/seeder images 2.66 GB
# EACH -- see them still sitting on the server as ghcr.io/parsasamiei/
# pishtalk:{migrator,seeder}. This stage needs none of that: only
# node_modules (deps already has the prisma CLI, tsx and bcryptjs, since
# `npm ci` there installs devDependencies too) plus the prisma directory.
#
# Prisma client is generated here rather than copied from builder -- a
# cross-stage COPY of node_modules/.prisma has to stay manually in sync with
# whatever the generator emits, and silently breaks when that changes.
#
# Migrate and seed are one image (and one container run) because the seed is
# idempotent -- prisma/seed.ts no-ops when the admin already exists, and skips
# entirely when SEED_ADMIN_* are unset -- so there is nothing to be gained
# from keeping them separately schedulable.
FROM deps AS migrator
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY prisma ./prisma
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]

# --- runner: minimal production image --------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

# Standalone output already includes a minimal node_modules + server.js.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Uploads directory: created here so it exists with correct ownership even
# before the named volume is mounted over it. Docker seeds a fresh named
# volume from this path, so this mode is what a new environment inherits.
#
# 755, not 750. The nginx container mounts this same volume read-only and
# serves /uploads/ from it (infra/nginx.conf), but nginx's *worker* processes
# drop to user `nginx` (uid 101) -- only the master stays root. With 750 and
# owner nextjs:nodejs (1001), those workers cannot even traverse the
# directory, so every uploaded file answers 403 "Permission denied" instead of
# being served. Group-sharing the gid instead does not work: nginx calls
# initgroups() when it drops privileges, which discards any supplementary
# group added via compose `group_add`.
#
# This still satisfies item 7 of the upload-security checklist in
# docs/05-frontend-architecture.md ("no execute permission"). That rule is
# about uploaded *files* not being executable or interpreted: files land 644
# (see src/lib/upload.ts), nginx serves them as inert statics with a fixed
# Content-Type plus nosniff, and its location block denies script extensions
# outright. On a directory the x bit is search/traverse permission, not
# "executable" -- withholding it blocks the web server, not an attacker.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads && chmod 755 /app/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
