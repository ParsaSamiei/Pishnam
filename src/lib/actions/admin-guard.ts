import "server-only";
import { auth } from "@/lib/auth";
import { formActionError } from "@/lib/form-state";

/**
 * Every admin content-mutation server action calls this first. Middleware
 * and the dashboard layout already gate page *access*, but server actions
 * can in principle be invoked directly, so each one re-checks auth itself
 * rather than trusting that a request only ever arrives via a page that was
 * already gated.
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * For actions restricted to the `owner` role (per docs/06-admin-panel.md:
 * "editor: content CRUD, no user/role management") -- currently just admin
 * account management.
 */
export async function requireOwnerSession() {
  const session = await requireAdminSession();
  if (session.user.role !== "owner") {
    throw new Error("Forbidden: owner role required");
  }
  return session;
}

/** Turns a zod error into the `{ field: message }` shape every admin form expects. */
export function firstErrorPerField(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Validation failure payload that keeps submitted field values for the client form. */
export function formErrorFromIssues(
  issues: { path: PropertyKey[]; message: string }[],
  formData: FormData,
) {
  return formActionError(firstErrorPerField(issues), formData);
}
