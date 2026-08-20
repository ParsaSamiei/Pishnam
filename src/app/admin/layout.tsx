import type { Metadata } from "next";
import { ThemeScript } from "@/components/layout/theme-script";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "پنل مدیریت پیشنام", template: "%s | پنل مدیریت پیشنام" },
  robots: { index: false, follow: false }, // admin is never indexable
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Admin is intentionally single-language (fa) and NOT locale-prefixed,
  // per docs/05-frontend-architecture.md, so this is its own independent
  // root layout rather than living under app/[locale]/.
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-bg-page text-text-primary min-h-screen font-[var(--font-fa)] antialiased">
        {children}
      </body>
    </html>
  );
}
