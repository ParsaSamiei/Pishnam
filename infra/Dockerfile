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
RUN npm run build

# --- runner: minimal production image --------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output already includes a minimal node_modules + server.js.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Uploads directory: created here so it exists with correct ownership even
# before the named volume is mounted over it; no execute bit, per the
# upload-security checklist in docs/05-frontend-architecture.md.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads && chmod 750 /app/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
