import { createHmac } from "node:crypto";

/**
 * Guest vote identity bound to client IP (HMAC'd — never store raw IPs).
 *
 * Cookie-based keys were resettable: clear cookie → new UUID → inflate counts.
 * IP-bound keys make one vote per message per network address. Shared NAT
 * (offices, mobile CGNAT) may collide; acceptable for anonymous guest votes.
 */
export function resolveVoterKey(ip: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for feedback voting");
  }

  const normalized = ip.trim().toLowerCase() || "unknown";
  return createHmac("sha256", secret).update(`feedback-vote:v1:${normalized}`).digest("hex");
}
