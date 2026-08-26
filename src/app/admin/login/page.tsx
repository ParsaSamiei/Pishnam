import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "ورود به پنل مدیریت | پیشنام",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // Proxy no longer handles this redirect (see proxy.ts) -- an
  // already-authenticated visitor landing here gets sent straight to the
  // dashboard instead of seeing the login form again.
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  const { callbackUrl } = await searchParams;

  return (
    <div className="bg-bg-page flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/brand/pishnam-logo.png"
            alt="پیشنام"
            width={56}
            height={62}
            className="h-14 w-auto"
          />
          <div>
            <h1 className="text-text-primary text-lg font-bold">پنل مدیریت پیشنام</h1>
            <p className="text-text-secondary mt-1 text-sm">برای ادامه وارد حساب کاربری خود شوید</p>
          </div>
        </div>

        <div className="border-border bg-bg-surface rounded-xl border p-6 shadow-sm">
          <LoginForm callbackUrl={callbackUrl ?? "/admin"} />
        </div>
      </div>
    </div>
  );
}
