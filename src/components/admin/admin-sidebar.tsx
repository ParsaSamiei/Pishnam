"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/(dashboard)/actions";

export function AdminSidebar({ userEmail, role }: { userEmail: string; role: string }) {
  const pathname = usePathname();
  const items = ADMIN_NAV_ITEMS.filter((item) => !item.ownerOnly || role === "owner");

  return (
    <aside className="border-border bg-bg-surface flex h-screen w-64 shrink-0 flex-col border-e">
      <div className="border-border flex items-center gap-2 border-b px-5 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="پیشنام">
          <Image
            src="/brand/pishnam-logo.png"
            alt=""
            width={28}
            height={31}
            className="h-7 w-auto"
          />
          <span className="text-text-primary font-bold">پنل مدیریت</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active && "bg-pishnam-gold-500/15 text-pishnam-gold-600",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-border border-t p-3">
        <p className="text-text-secondary truncate px-3 text-xs">{userEmail}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-text-secondary hover:bg-bg-surface-alt hover:text-pishnam-danger mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <LogOut className="size-4" aria-hidden="true" />
            خروج
          </button>
        </form>
      </div>
    </aside>
  );
}
