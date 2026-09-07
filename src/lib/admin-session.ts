import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type VerifiedAdminUser = {
  id: string;
  email: string;
  role: "owner" | "editor";
};

/** Route that clears a stale JWT via signOut (must be a Route Handler). */
export const CLEAR_STALE_ADMIN_SESSION_PATH = "/admin/clear-session";

/**
 * Resolves the JWT session against the live AdminUser row.
 * Disabled or deleted accounts are treated as unauthenticated so suspension
 * takes effect immediately (JWTs are otherwise long-lived).
 */
export async function getVerifiedAdminUser(): Promise<VerifiedAdminUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, disabledAt: true },
  });

  if (!adminUser || adminUser.disabledAt) return null;

  return {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  };
}

/**
 * When the JWT refers to a missing/disabled admin, return the clear-session
 * path so callers can `redirect()` there. Cookie mutation is not allowed in
 * Server Components (layouts/pages), only in Route Handlers / Server Actions.
 */
export async function getStaleSessionClearPath(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { disabledAt: true },
  });

  if (!adminUser || adminUser.disabledAt) {
    return CLEAR_STALE_ADMIN_SESSION_PATH;
  }

  return null;
}
