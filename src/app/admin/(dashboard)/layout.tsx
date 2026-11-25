import { redirect } from "next/navigation";
import { getVerifiedAdminUser, getStaleSessionClearPath } from "@/lib/admin-session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // This is now the primary auth gate for the whole /admin/(dashboard)
  // tree -- proxy.ts handles locale routing only (see its comment for
  // why admin auth moved out of it). Every server action under here also
  // independently re-checks the session via requireAdminSession()/
  // requireOwnerSession(), so protection doesn't rest on this file alone.
  //
  // Verifies against the live AdminUser row so a disabled account loses
  // dashboard access immediately, not only on next login.
  const user = await getVerifiedAdminUser();
  if (!user) {
    redirect((await getStaleSessionClearPath()) ?? "/admin/login");
  }

  return (
    <div className="flex">
      <AdminSidebar userEmail={user.email} role={user.role} />
      <div className="min-h-screen flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
