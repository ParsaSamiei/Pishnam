import { notFound } from "next/navigation";

// Catch every path under [locale] that no other page.tsx owns, then hand off
// to app/[locale]/not-found.tsx. Without this, Next.js falls back to its
// generic 404 instead of our localized page (next-intl error-files docs).
export default function CatchAllPage() {
  notFound();
}
