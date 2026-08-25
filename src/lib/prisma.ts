import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton -- avoids exhausting the Postgres
// connection pool from hot-reload creating a new PrismaClient per edit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Neon / PgBouncer: Prisma's default pool is `num_cpus * 2 + 1` (often 17).
 * Each Next.js worker gets its own client, so that quickly exhausts the
 * remote pooler and surfaces as:
 *   "Timed out fetching a new connection from the connection pool"
 * Keep the client-side pool at 1 when talking through PgBouncer.
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

    if (viaPooler && !url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
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
