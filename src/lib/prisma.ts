import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton -- avoids exhausting the Postgres
// connection pool from hot-reload creating a new PrismaClient per edit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Neon / PgBouncer: Prisma's default pool is `num_cpus * 2 + 1` (often 17).
 * Each Next.js build worker / serverless instance gets its own client, so
 * that quickly exhausts the remote pooler and surfaces as:
 *   "Timed out fetching a new connection from the connection pool"
 *
 * Keep the client-side pool small when talking through PgBouncer, but not
 * at 1 -- static generation and the layout footer issue concurrent queries
 * in the same process. A pool of a few connections is safe via PgBouncer
 * (client slots are cheap) and avoids P2024 during `next build`.
 *
 * @see https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool
 * @see https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-serverless#configure-your-database-connection-url
 */
function datasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    const viaPooler =
      url.searchParams.get("pgbouncer") === "true" ||
      url.hostname.includes("-pooler") ||
      url.hostname.includes("pooler.");

    if (viaPooler) {
      if (!url.searchParams.has("connection_limit")) {
        // Build workers prerender pages sequentially (see next.config
        // staticGenerationMaxConcurrency), but a single page still runs
        // layout + page queries in parallel -- need more than 1 slot.
        url.searchParams.set("connection_limit", "5");
      }
      if (!url.searchParams.has("pool_timeout")) {
        // Neon compute can take a few seconds to wake from idle.
        url.searchParams.set("pool_timeout", "20");
      }
    }

    return url.toString();
  } catch {
    return raw;
  }
}

function createPrismaClient() {
  const url = datasourceUrl();
  return new PrismaClient({
    ...(url ? { datasources: { db: { url } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
