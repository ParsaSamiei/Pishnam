import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the NextAuth config -- kept separate from Node-only auth.ts.
 *
 * Deliberately excludes the Credentials provider (it needs bcryptjs + Prisma,
 * neither of which run on the Edge runtime). The real provider is registered
 * in auth.ts, which is only ever imported from Node-runtime code (route
 * handlers, server actions, admin layout).
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "owner" | "editor";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
