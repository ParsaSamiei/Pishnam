import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

// Locale routing only. This file MUST live at src/middleware.ts, not at the
// project root -- Next.js requires middleware to be colocated with src/
// when a src/ directory layout is used (this project's app/ lives at
// src/app/). Placing it at the true project root silently broke rewrites
// for the bare "/" request specifically (sub-paths like /courses still
// worked, which made this surprisingly easy to miss) -- confirmed by
// testing, not just docs.
//
// Admin auth-gating deliberately does NOT live here. It's handled entirely
// in src/app/admin/(dashboard)/layout.tsx (redirects unauthenticated
// visitors to /admin/login) and src/app/admin/login/page.tsx (redirects an
// already-authenticated visitor away from the login form). Every admin
// server action also independently re-checks the session via
// requireAdminSession()/requireOwnerSession(), so none of this depends on
// middleware for actual protection -- keeping middleware single-purpose
// (locale routing only) is simpler to reason about than composing it with
// auth logic.
export default createIntlMiddleware(routing);

export const config = {
  matcher: [
    // Run on every route except: API routes, Next internals, the public
    // uploads path, the whole /admin tree (single-language, not part of
    // locale routing), and anything with a file extension.
    "/((?!api|_next|_vercel|uploads|admin|.*\\..*).*)",
  ],
};
