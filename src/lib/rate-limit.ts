/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Deliberately not backed by Redis: this deploys as a single Next.js
 * instance (docs/05-frontend-architecture.md doesn't call for horizontal
 * scaling), so per-process memory is sufficient and avoids adding an
 * infra dependency. If this ever moves to multiple instances, swap this
 * for a shared store -- every call site goes through `rateLimit()` below,
 * so that'd be a one-file change.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup so `buckets` doesn't grow unbounded over a long-running
// process.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  },
  10 * 60 * 1000,
).unref?.();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key Unique identifier for the caller + action, e.g. `upload:${ip}`
 *   or `lead:${type}:${ip}`. Namespacing by action matters -- don't share a
 *   single bucket across unrelated endpoints.
 * @param limit Max requests allowed within `windowMs`.
 * @param windowMs Window size in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Best-effort client IP extraction behind the nginx reverse proxy. */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}
