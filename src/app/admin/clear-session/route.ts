import { signOut } from "@/lib/auth";

/**
 * Cookie-clearing must happen in a Route Handler (not a Server Component).
 * Used when a JWT still exists for a deleted/disabled admin account.
 */
export async function GET() {
  await signOut({ redirectTo: "/admin/login" });
}
